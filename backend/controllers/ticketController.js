const Ticket = require("../models/Ticket");
const Project = require("../models/Project");
const User = require("../models/User");
const Comment = require("../models/Comment");
const { sendEmail, emailTemplates } = require("../utils/emailService");

exports.createTicket = async (req, res) => {
  try {
    const { title, description, project, assignee, priority, type, tags } =
      req.body;

    if (!title || !project) {
      return res
        .status(400)
        .json({ message: "Title and project are required" });
    }

    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isTeamMember =
      projectExists.owner.toString() === req.user._id.toString() ||
      projectExists.teamMembers.some(
        (member) => member.toString() === req.user._id.toString(),
      );

    if (!isTeamMember) {
      return res
        .status(403)
        .json({ message: "Not authorized to create tickets in this project" });
    }

    // Auto-add creator to teamMembers if not already present
    if (!projectExists.teamMembers.includes(req.user._id)) {
      projectExists.teamMembers.push(req.user._id);
      await projectExists.save();
    }

    // Auto-add assignee to teamMembers if provided and not already a member
    if (assignee) {
      const assigneeExists = await User.findById(assignee);
      if (!assigneeExists) {
        return res.status(404).json({ message: "Assignee user not found" });
      }

      if (!projectExists.teamMembers.includes(assignee)) {
        projectExists.teamMembers.push(assignee);
        await projectExists.save();
      }
    }

    const ticket = await Ticket.create({
      title,
      description,
      project,
      creator: req.user._id,
      assignee: assignee || null,
      priority: priority || "medium",
      type: type || "bug",
      tags: tags || [],
    });

    await ticket.populate("creator assignee project", "name email title");

    if (assignee && assignee !== req.user._id.toString()) {
      const assignedUser = await User.findById(assignee);
      if (assignedUser && assignedUser.emailNotifications) {
        try {
          await sendEmail({
            to: assignedUser.email,
            subject: `New Ticket Assigned: ${title}`,
            html: emailTemplates.ticketAssigned(
              assignedUser.name,
              title,
              ticket._id,
              projectExists.title,
              req.user.name,
            ),
          });
        } catch (emailError) {
          console.error("Failed to send ticket assignment email:", emailError);
        }
      }
    }

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const { projectId, status, priority, assignee, search, type } = req.query;

    let query = {};

    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const isTeamMember =
        project.owner.toString() === req.user._id.toString() ||
        project.teamMembers.some(
          (member) => member.toString() === req.user._id.toString(),
        );

      if (!isTeamMember) {
        return res
          .status(403)
          .json({ message: "Not authorized to view tickets in this project" });
      }

      query.project = projectId;
    } else {
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { teamMembers: req.user._id }],
      }).select("_id");

      query.project = { $in: userProjects.map((p) => p._id) };
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignee) query.assignee = assignee;
    if (type) query.type = type;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const tickets = await Ticket.find(query)
      .populate("creator assignee", "name email")
      .populate("project", "title")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("creator assignee", "name email")
      .populate("project", "title owner teamMembers");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const project = ticket.project;
    const isAuthorized =
      project.owner.toString() === req.user._id.toString() ||
      project.teamMembers.some(
        (member) => member.toString() === req.user._id.toString(),
      );

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this ticket" });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("project");

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
        .json({ message: "Not authorized to update this ticket" });
    }

    const { title, description, status, priority, assignee, type, tags } =
      req.body;

    // Auto-add assignee to teamMembers if being changed and not already a member
    if (assignee !== undefined && assignee !== null) {
      const assigneeExists = await User.findById(assignee);
      if (!assigneeExists) {
        return res.status(404).json({ message: "Assignee user not found" });
      }

      if (!project.teamMembers.includes(assignee)) {
        project.teamMembers.push(assignee);
        await project.save();
      }
    }

    const oldAssignee = ticket.assignee ? ticket.assignee.toString() : null;
    const newAssignee = assignee !== undefined ? assignee : oldAssignee;

    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    if (assignee !== undefined) ticket.assignee = assignee;
    if (type) ticket.type = type;
    if (tags) ticket.tags = tags;

    await ticket.save();
    await ticket.populate("creator assignee", "name email");

    if (
      newAssignee &&
      newAssignee !== oldAssignee &&
      newAssignee !== req.user._id.toString()
    ) {
      const assignedUser = await User.findById(newAssignee);
      if (assignedUser && assignedUser.emailNotifications) {
        try {
          await sendEmail({
            to: assignedUser.email,
            subject: `Ticket Assigned: ${ticket.title}`,
            html: emailTemplates.ticketAssigned(
              assignedUser.name,
              ticket.title,
              ticket._id,
              project.title,
              req.user.name,
            ),
          });
        } catch (emailError) {
          console.error("Failed to send assignment notification:", emailError);
        }
      }
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("project");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const project = await Project.findById(ticket.project._id);
    const isOwnerOrCreator =
      project.owner.toString() === req.user._id.toString() ||
      ticket.creator.toString() === req.user._id.toString();

    if (!isOwnerOrCreator) {
      return res.status(403).json({
        message: "Only project owner or ticket creator can delete this ticket",
      });
    }

    // Delete all comments associated with this ticket
    await Comment.deleteMany({ ticket: req.params.id });

    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: "Ticket and associated comments deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !["todo", "in-progress", "done"].includes(status)) {
      return res.status(400).json({ message: "Valid status is required" });
    }

    const ticket = await Ticket.findById(req.params.id).populate(
      "project assignee",
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
        .json({ message: "Not authorized to update ticket status" });
    }

    const oldStatus = ticket.status;
    ticket.status = status;
    await ticket.save();
    await ticket.populate("creator assignee", "name email");

    if (
      ticket.assignee &&
      ticket.assignee._id.toString() !== req.user._id.toString() &&
      ticket.assignee.emailNotifications
    ) {
      try {
        await sendEmail({
          to: ticket.assignee.email,
          subject: `Ticket Status Updated: ${ticket.title}`,
          html: emailTemplates.ticketStatusChanged(
            ticket.assignee.name,
            ticket.title,
            oldStatus,
            status,
            req.user.name,
            project.title,
          ),
        });
      } catch (emailError) {
        console.error("Failed to send status change notification:", emailError);
      }
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
