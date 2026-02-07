const Project = require("../models/Project");
const Ticket = require("../models/Ticket");
const Comment = require("../models/Comment");

exports.getDashboardAnalytics = async (req, res) => {
  try {
    // Get all projects user has access to
    const userProjects = await Project.find({
      $or: [
        { owner: req.user._id },
        { teamMembers: req.user._id }
      ]
    }).select('_id');

    const projectIds = userProjects.map(p => p._id);

    // Project stats
    const totalProjects = await Project.countDocuments({
      $or: [
        { owner: req.user._id },
        { teamMembers: req.user._id }
      ]
    });

    const activeProjects = await Project.countDocuments({
      $or: [
        { owner: req.user._id },
        { teamMembers: req.user._id }
      ],
      status: 'active'
    });

    const archivedProjects = await Project.countDocuments({
      $or: [
        { owner: req.user._id },
        { teamMembers: req.user._id }
      ],
      status: 'archived'
    });

    const completedProjects = await Project.countDocuments({
      $or: [
        { owner: req.user._id },
        { teamMembers: req.user._id }
      ],
      status: 'completed'
    });

    // Ticket stats
    const totalTickets = await Ticket.countDocuments({
      project: { $in: projectIds }
    });

    const myAssigned = await Ticket.countDocuments({
      assignee: req.user._id,
      status: { $in: ['todo', 'in-progress'] }
    });

    const myCreated = await Ticket.countDocuments({
      creator: req.user._id
    });

    // Tickets by status
    const ticketsByStatus = await Ticket.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusCounts = {
      todo: 0,
      'in-progress': 0,
      done: 0
    };
    ticketsByStatus.forEach(item => {
      statusCounts[item._id] = item.count;
    });

    // Tickets by priority
    const ticketsByPriority = await Ticket.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const priorityCounts = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };
    ticketsByPriority.forEach(item => {
      priorityCounts[item._id] = item.count;
    });

    // Recent activity (last 20 items)
    const recentTickets = await Ticket.find({
      project: { $in: projectIds }
    })
      .populate('creator', 'name email')
      .populate('project', 'title key')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const recentComments = await Comment.find({
      ticket: { 
        $in: await Ticket.find({ project: { $in: projectIds } }).distinct('_id')
      }
    })
      .populate('user', 'name email')
      .populate({
        path: 'ticket',
        select: 'title project',
        populate: { path: 'project', select: 'key title' }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Combine and sort activities
    const recentActivity = [
      ...recentTickets.map(t => ({
        type: 'ticket_created',
        user: t.creator,
        ticket: { _id: t._id, title: t.title, project: t.project },
        timestamp: t.createdAt
      })),
      ...recentComments.map(c => ({
        type: 'comment_added',
        user: c.user,
        ticket: c.ticket ? { 
          _id: c.ticket._id, 
          title: c.ticket.title,
          project: c.ticket.project
        } : null,
        timestamp: c.createdAt
      }))
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);

    res.json({
      projects: {
        total: totalProjects,
        active: activeProjects,
        archived: archivedProjects,
        completed: completedProjects
      },
      tickets: {
        total: totalTickets,
        myAssigned,
        myCreated,
        byStatus: statusCounts,
        byPriority: priorityCounts
      },
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectStats = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if user has access to project
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user._id },
        { teamMembers: req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }

    // Get ticket stats for this project
    const totalTickets = await Ticket.countDocuments({ project: projectId });

    const ticketsByStatus = await Ticket.aggregate([
      { $match: { project: projectId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusCounts = {
      todo: 0,
      'in-progress': 0,
      done: 0
    };
    ticketsByStatus.forEach(item => {
      statusCounts[item._id] = item.count;
    });

    const lastActivity = await Ticket.findOne({ project: projectId })
      .sort({ updatedAt: -1 })
      .select('updatedAt');

    res.json({
      totalTickets,
      byStatus: statusCounts,
      lastActivity: lastActivity?.updatedAt || project.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};