import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { videoAPI } from '../services/api';
import { User, Send, Trash2, MessageSquare, Loader2 } from 'lucide-react';

interface Comment {
  _id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

interface CommentSectionProps {
  videoId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ videoId }) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (videoId) {
      fetchComments();
    }
  }, [videoId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await videoAPI.getVideoComments(videoId);
      setComments(response.data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setError('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please login to comment');
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await videoAPI.addComment(
        videoId, 
        newComment, 
        user?.name || user?.email, 
        user?.avatar
      );
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await videoAPI.deleteComment(commentId);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setError('Failed to delete comment');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center space-x-3">
          <MessageSquare className="text-[#00A8E1]" size={24} />
          <h3 className="text-xl font-bold text-white tracking-widest">COMMENTS ({comments.length})</h3>
        </div>
      </div>

      {/* Comment Input */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div className="flex space-x-4">
            <div className="flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="Me" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00A8E1] to-[#6c5ce7] flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts on this cinematic masterpiece..."
                className="w-full bg-[#1a1a1a] text-white/90 placeholder-white/20 rounded-xl p-4 min-h-[100px] border border-white/5 focus:border-[#00A8E1]/50 focus:ring-0 transition-all resize-none shadow-inner"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="flex items-center space-x-2 px-8 py-3 bg-[#00A8E1] hover:bg-[#0092c4] disabled:opacity-50 disabled:bg-white/5 text-white font-black text-xs tracking-[0.2em] rounded-lg transition-all active:scale-95 shadow-[0_0_20px_rgba(0,168,225,0.2)]"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              <span>POST COMMENT</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-8 text-center">
          <p className="text-white/40 mb-4">You must be logged in to join the conversation.</p>
          <a href="/login" className="text-[#00A8E1] font-bold hover:underline">Login Now</a>
        </div>
      )}

      {error && <p className="text-red-500 text-sm font-medium bg-red-500/10 p-4 rounded-lg border border-red-500/20">{error}</p>}

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#00A8E1]" size={32} />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="group flex space-x-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
              <div className="flex-shrink-0">
                {comment.userAvatar ? (
                  <img src={comment.userAvatar} className="w-10 h-10 rounded-full object-cover border border-white/5" alt={comment.userName} />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 border border-white/10 uppercase font-black text-xs">
                    {comment.userName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-black text-white/90 tracking-wider">
                      {comment.userName.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-medium text-white/20 bg-white/5 px-2 py-0.5 rounded">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {(user?.id === comment.userId || user?.role === 'admin') && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-500 transition-all rounded-lg hover:bg-red-500/10"
                      title="Delete comment"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <p className="text-white/60 leading-relaxed font-light text-sm">
                  {comment.text}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-white/5 rounded-3xl">
            <MessageSquare className="mx-auto text-white/5 mb-4" size={48} />
            <p className="text-white/20 font-medium tracking-widest text-xs uppercase">No comments yet. Be the first to start the discussion!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
