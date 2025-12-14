const express = require('express');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');
const router = express.Router();

// GET all tasks (superuser sees all, users see all but can only delete their own)
router.get('/', auth.requireAuth, async (req, res) => {
  try {
    let tasks;
    if (req.superuser) {
      // Superuser sees all tasks
      tasks = await Task.find().populate('createdBy', 'email').sort({ createdAt: -1 });
    } else {
      // Regular users see all tasks (for commenting)
      tasks = await Task.find().populate('createdBy', 'email').sort({ createdAt: -1 });
    }
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET task by ID
router.get('/:id', auth.requireAuth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('createdBy', 'username');
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create task
router.post('/', auth.requireAuth, async (req, res) => {
  try {
    const task = new Task({ 
      ...req.body, 
      createdBy: req.user._id 
    });
    await task.save();
    const populatedTask = await Task.findById(task._id).populate('createdBy', 'username');
    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT edit task (owner only)
router.put('/:id', auth.requireAuth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check ownership (superuser can edit any)
    if (task.createdBy.toString() !== req.user._id.toString() && !req.superuser) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    Object.assign(task, req.body);
    await task.save();
    const populatedTask = await Task.findById(task._id).populate('createdBy', 'username');
    res.json(populatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE task (owner or superuser)
router.delete('/:id', auth.requireAuth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check ownership or superuser
    if (task.createdBy.toString() !== req.user._id.toString() && !req.superuser) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Delete associated comments first
    await Comment.deleteMany({ task: task._id });
    
    // Delete the task
    await Task.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;