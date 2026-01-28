const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.post('/:id/members', protect, addTeamMember);
router.delete('/:id/members', protect, removeTeamMember);

module.exports = router;
