const Comment = require("../models/Comment");
const Ticket = require("../models/Ticket");
const Project = require("../models/Project");
const User = require("../models/User");
const { sendEmail, emailTemplates } = require("../utils/emailService");

exports.createComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { ticketId } = req.params;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const ticket = await Ticket.findById(ticketId).populate(
      "project creator assignee",
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const project = await Project.findById(ticket.project._id);
    const isAuthorized =
      project.owner.toString() === req.user._id.toString() ||
      project.teamMembers.some(
        (member) => member.toString() === req.user._id.toString(),
      );

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Not authorized to comment on this ticket" });
    }

    // Enforce: only project members (owner or teamMembers) can comment.
    // Do NOT auto-add comment authors here; membership must be explicit.
    const comment = await Comment.create({
      ticket: ticketId,
      user: req.user._id,
      text,
    });

    await comment.populate("user", "name email");

    const notifyUsers = new Set();

    if (
      ticket.creator &&
      ticket.creator._id.toString() !== req.user._id.toString()
    ) {
      notifyUsers.add(ticket.creator._id.toString());
    }

    if (
      ticket.assignee &&
      ticket.assignee._id.toString() !== req.user._id.toString()
    ) {
      notifyUsers.add(ticket.assignee._id.toString());
    }

    for (const userId of notifyUsers) {
      const user = await User.findById(userId);
      if (user && user.emailNotifications) {
        try {
          await sendEmail({
            to: user.email,
            subject: `New Comment on: ${ticket.title}`,
            html: emailTemplates.newComment(
              user.name,
              ticket.title,
              req.user.name,
              text,
              project.title,
            ),
          });
        } catch (emailError) {
          console.error("Failed to send comment notification:", emailError);
        }
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId).populate("project");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const project = await Project.findById(ticket.project._id);
    const isAuthorized =
      project.owner.toString() === req.user._id.toString() ||
      project.teamMembers.some(
        (member) => member.toString() === req.user._id.toString(),
      );

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Not authorized to view comments" });
    }

    const comments = await Comment.find({ ticket: ticketId })
      .populate("user", "name email")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this comment" });
    }

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    comment.text = text;
    await comment.save();
    await comment.populate("user", "name email");

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
