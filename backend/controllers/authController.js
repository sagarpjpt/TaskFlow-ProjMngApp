const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const OTP = require("../models/OTP");
const Project = require("../models/Project");
const Ticket = require("../models/Ticket");
const Comment = require("../models/Comment");
const {
  sendEmail,
  generateOTP,
  emailTemplates,
} = require("../utils/emailService");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      isEmailVerified: false,
    });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      user: user._id,
      email: user.email,
      otp,
      type: "email_verification",
      expiresAt: otpExpiry,
    });

    try {
      await sendEmail({
        to: user.email,
        subject: "Email Verification - Bug Tracker",
        html: emailTemplates.verificationOTP(user.name, otp),
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      token: generateToken(user._id),
      message:
        "Registration successful. Please check your email for verification OTP.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      type: "email_verification",
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findById(otpRecord.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isEmailVerified = true;
    await user.save();

    otpRecord.isUsed = true;
    await otpRecord.save();

    res.json({
      message: "Email verified successfully",
      isEmailVerified: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    await OTP.updateMany(
      { email: email.toLowerCase(), type: "email_verification", isUsed: false },
      { isUsed: true },
    );

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      user: user._id,
      email: user.email,
      otp,
      type: "email_verification",
      expiresAt: otpExpiry,
    });

    await sendEmail({
      to: user.email,
      subject: "Email Verification - Bug Tracker",
      html: emailTemplates.verificationOTP(user.name, otp),
    });

    res.json({ message: "Verification OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide email address" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "No user found with this email" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request - Bug Tracker",
        html: emailTemplates.passwordReset(user.name, resetUrl),
      });

      res.json({ message: "Password reset link sent to your email" });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Please provide new password" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      message: "Password reset successful",
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      emailNotifications: user.emailNotifications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, emailNotifications } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (emailNotifications !== undefined)
      user.emailNotifications = emailNotifications;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      emailNotifications: user.emailNotifications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user owns any projects
    const ownedProjects = await Project.find({ owner: userId });
    if (ownedProjects.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete user who owns projects. Transfer ownership first.",
        projectCount: ownedProjects.length,
      });
    }

    // Check if user is assigned to any tickets
    const assignedTickets = await Ticket.find({ assignee: userId });
    if (assignedTickets.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete user with assigned tickets. Unassign tickets first.",
        ticketCount: assignedTickets.length,
      });
    }

    // Check if user has created any tickets (optional - can be transferred)
    const createdTickets = await Ticket.find({ creator: userId });

    // Check if user has created any comments (optional - can be transferred)
    const createdComments = await Comment.find({ user: userId });

    // If only has created content but no assignments/ownership, allow deletion
    // with optional transfer of authorship
    await User.findByIdAndDelete(userId);

    res.json({
      message: "User deleted successfully",
      ticketsCreated: createdTickets.length,
      commentsCreated: createdComments.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
