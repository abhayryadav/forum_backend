// backend/src/services/commentService.js
const Comment = require('../models/Comment');

exports.createComment = async (data) => {
  return await Comment.create(data);
};

exports.getCommentsByTask = async (taskId) => {
  return await Comment.find({ taskId }).sort({ createdAt: -1 });
};

exports.updateComment = async (id, data) => {
  return await Comment.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteComment = async (id) => {
  return await Comment.findByIdAndDelete(id);
};