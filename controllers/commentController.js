// backend/src/controllers/commentController.js
const commentService = require('../services/commentService');

exports.addComment = async (req, res) => {
  try {
    const { text, taskId } = req.body;
    if (!text || !taskId) return res.status(400).json({ error: 'Missing fields' });
    const comment = await commentService.createComment({ text, taskId });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.editComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const comment = await commentService.updateComment(id, { text });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await commentService.deleteComment(id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const comments = await commentService.getCommentsByTask(taskId);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};