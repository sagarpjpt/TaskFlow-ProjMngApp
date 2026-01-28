const Project = require('../models/Project');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

exports.createProject = async (req, res) => {
  try {
    const { title, description, teamMembers } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Project title is required' });
    }

    const project = await Project.create({
      title,
      description,
      owner: req.user._id,
      teamMembers: teamMembers || [req.user._id],
    });

    await project.populate('owner teamMembers', 'name email');

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { teamMembers: req.user._id },
      ],
    })
      .populate('owner teamMembers', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner teamMembers', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isAuthorized =
      project.owner._id.toString() === req.user._id.toString() ||
      project.teamMembers.some(
        (member) => member._id.toString() === req.user._id.toString()
      );

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
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
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project owner can update the project' });
    }

    const { title, description, status, teamMembers } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (status) project.status = status;
    if (teamMembers) project.teamMembers = teamMembers;

    await project.save();
    await project.populate('owner teamMembers', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project owner can delete the project' });
    }

    await Ticket.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project and associated tickets deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addTeamMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project owner can add team members' });
    }

    if (project.teamMembers.includes(userId)) {
      return res.status(400).json({ message: 'User is already a team member' });
    }

    project.teamMembers.push(userId);
    await project.save();
    await project.populate('owner teamMembers', 'name email');

    const newMember = await User.findById(userId);
    if (newMember && newMember.emailNotifications) {
      try {
        const { sendEmail, emailTemplates } = require('../utils/emailService');
        await sendEmail({
          to: newMember.email,
          subject: `Added to Project: ${project.title}`,
          html: emailTemplates.addedToProject(
            newMember.name,
            project.title,
            req.user.name,
            project.description || ''
          ),
        });
      } catch (emailError) {
        console.error('Failed to send project invitation email:', emailError);
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
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project owner can remove team members' });
    }

    if (project.owner.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove project owner' });
    }

    project.teamMembers = project.teamMembers.filter(
      (member) => member.toString() !== userId
    );

    await project.save();
    await project.populate('owner teamMembers', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
