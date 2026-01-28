const express = require('express');
const router = express.Router();
const {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.route('/ticket/:ticketId')
  .post(protect, createComment)
  .get(protect, getComments);

router.route('/:id')
  .put(protect, updateComment)
  .delete(protect, deleteComment);

module.exports = router;
