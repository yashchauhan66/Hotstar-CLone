import { Comment } from '../models/Comment.js';
import { Video } from '../models/Video.js';

export const addComment = async (req, res) => {
  try {
    const { videoId, text, userName, userAvatar } = req.body;
    const userId = req.user.id;

    if (!videoId || !text) {
      return res.status(400).json({ message: 'Video ID and comment text are required' });
    }

    // Verify video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const newComment = new Comment({
      videoId,
      userId,
      userName: userName || 'Anonymous',
      userAvatar: userAvatar || '',
      text
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
};

export const getVideoComments = async (req, res) => {
  try {
    const { videoId } = req.params;
    const comments = await Comment.find({ videoId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error fetching comments' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Onlyallow delete if it's the user's comment OR user is admin
    if (comment.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(commentId);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error deleting comment' });
  }
};
