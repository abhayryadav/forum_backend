const express = require('express');
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const router = express.Router();

// GET comments for task
router.get('/task/:taskId', auth.requireAuth, async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST add comment
router.post('/', auth.requireAuth, async (req, res) => {
  try {
    // Verify task exists
    const task = await Task.findById(req.body.task);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const comment = new Comment({ 
      ...req.body, 
      createdBy: req.user._id 
    });
    await comment.save();
    const populated = await Comment.findById(comment._id).populate('createdBy', 'username');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT edit comment (owner only)
router.put('/:id', auth.requireAuth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Check ownership
    if (comment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    Object.assign(comment, req.body);
    await comment.save();
    const populated = await Comment.findById(comment._id).populate('createdBy', 'username');
    res.json(populated);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE comment (owner or superuser)
router.delete('/:id', auth.requireAuth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Check ownership or superuser
    if (comment.createdBy.toString() !== req.user._id.toString() && !req.superuser) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;