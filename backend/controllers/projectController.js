const Project = require("../models/Project");
const Ticket = require("../models/Ticket");
const Comment = require("../models/Comment");
const User = require("../models/User");

exports.createProject = async (req, res) => {
  try {
    const { title, key, description, teamMembers } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Project title is required" });
    }

    if (!key) {
      return res.status(400).json({ message: "Project key is required" });
    }

    const keyRegex = /^[A-Z]{2,10}$/;
    if (!keyRegex.test(key)) {
      return res.status(400).json({ 
        message: "Project key must be 2-10 uppercase letters" 
      });
    }

    const existingProject = await Project.findOne({ key: key.toUpperCase() });
    if (existingProject) {
      return res.status(400).json({ 
        message: "Project key already exists. Please choose a different key." 
      });
    }

    const project = await Project.create({
      title,
      key: key.toUpperCase(),
      description,
      owner: req.user._id,
      teamMembers: teamMembers || [req.user._id],
    });

    await project.populate("owner teamMembers", "name email");
    res.status(201).json(project);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Project key already exists. Please choose a different key." 
      });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const { includeStats } = req.query;

    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { teamMembers: req.user._id }],
    })
      .populate("owner teamMembers", "name email")
      .sort({ createdAt: -1 });

    if (includeStats === 'true') {
      const projectsWithStats = await Promise.all(
        projects.map(async (project) => {
          const ticketCounts = await Ticket.aggregate([
            { $match: { project: project._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ]);
          
          const lastTicket = await Ticket.findOne({ project: project._id })
            .sort({ updatedAt: -1 })
            .select('updatedAt');
          
          const statusBreakdown = { todo: 0, 'in-progress': 0, done: 0 };
          let totalTickets = 0;
          
          ticketCounts.forEach(item => {
            statusBreakdown[item._id] = item.count;
            totalTickets += item.count;
          });

          return {
            ...project.toObject(),
            stats: {
              totalTickets,
              byStatus: statusBreakdown,
              lastActivity: lastTicket?.updatedAt || project.updatedAt
            }
          };
        })
      );
      
      return res.json(projectsWithStats);
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "owner teamMembers",
      "name email",
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isAuthorized =
      project.owner._id.toString() === req.user._id.toString() ||
      project.teamMembers.some(
        (member) => member._id.toString() === req.user._id.toString(),
      );

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this project" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only project owner can update the project" });
    }

    const { title, description, status, teamMembers } = req.body;

    // Track removed members to handle ticket assignment cleanup
    const oldTeamMemberIds = project.teamMembers.map((m) => m.toString());
    const newTeamMemberIds = teamMembers
      ? teamMembers.map((m) => m.toString())
      : oldTeamMemberIds;
    const removedMemberIds = oldTeamMemberIds.filter(
      (id) => !newTeamMemberIds.includes(id),
    );

    if (title) project.title = title;
    if (description) project.description = description;
    if (status) project.status = status;
    if (teamMembers) project.teamMembers = teamMembers;

    // If members were removed, unassign any tickets assigned to those members
    if (removedMemberIds.length > 0) {
      await Ticket.updateMany(
        {
          project: req.params.id,
          assignee: { $in: removedMemberIds },
        },
        { assignee: null },
      );
    }

    await project.save();
    await project.populate("owner teamMembers", "name email");

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only project owner can delete the project" });
    }

    // Get all tickets in the project and delete their comments
    const tickets = await Ticket.find({ project: req.params.id }).select("_id");
    const ticketIds = tickets.map((t) => t._id);

    // Delete all comments associated with project tickets
    await Comment.deleteMany({ ticket: { $in: ticketIds } });

    // Delete all tickets in the project
    await Ticket.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: "Project, associated tickets, and comments deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addTeamMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only project owner can add team members" });
    }

    if (project.teamMembers.includes(userId)) {
      return res.status(400).json({ message: "User is already a team member" });
    }

    project.teamMembers.push(userId);
    await project.save();
    await project.populate("owner teamMembers", "name email");

    const newMember = await User.findById(userId);
    if (newMember && newMember.emailNotifications) {
      try {
        const { sendEmail, emailTemplates } = require("../utils/emailService");
        await sendEmail({
          to: newMember.email,
          subject: `Added to Project: ${project.title}`,
          html: emailTemplates.addedToProject(
            newMember.name,
            project.title,
            req.user.name,
            project.description || "",
          ),
        });
      } catch (emailError) {
        console.error("Failed to send project invitation email:", emailError);
      }
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeTeamMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only project owner can remove team members" });
    }

    if (project.owner.toString() === userId) {
      return res.status(400).json({ message: "Cannot remove project owner" });
    }

    // Remove user from team
    project.teamMembers = project.teamMembers.filter(
      (member) => member.toString() !== userId,
    );

    // Unassign any tickets that were assigned to the removed member
    await Ticket.updateMany(
      { project: req.params.id, assignee: userId },
      { assignee: null },
    );

    await project.save();
    await project.populate("owner teamMembers", "name email");

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
