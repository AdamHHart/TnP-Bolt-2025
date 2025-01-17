import React, { useState, useEffect } from 'react';
import { MessageSquare, Reply } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Comment {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  parent_id: string | null;
  path: string;
  depth: number;
  users: {
    username: string;
    avatar: string | null;
  };
}

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users (
            username,
            avatar
          )
        `)
        .eq('post_id', postId)
        .order('path', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          post_id: postId,
          author_id: user.id,
          parent_id: replyTo
        });

      if (error) throw error;

      setNewComment('');
      setReplyTo(null);
      await fetchComments();
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderCommentForm = (parentId: string | null = null) => (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={parentId ? "Write a reply..." : "Write a comment..."}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
          required
        />
      </div>
      <div className="flex justify-between items-center">
        {parentId && (
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel Reply
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !user}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 ml-auto"
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );

  const renderComment = (comment: Comment) => {
    const paddingLeft = comment.depth * 2;

    return (
      <div
        key={comment.id}
        className="py-4"
        style={{ paddingLeft: `${paddingLeft}rem` }}
      >
        <div className="flex items-start space-x-3">
          {comment.users.avatar ? (
            <img
              src={comment.users.avatar}
              alt={comment.users.username}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-medium">
                {comment.users.username[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900">
                  {comment.users.username}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
            {user && comment.depth < 4 && (
              <button
                onClick={() => setReplyTo(comment.id)}
                className="mt-1 text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <Reply className="h-4 w-4" />
                <span>Reply</span>
              </button>
            )}
            {replyTo === comment.id && (
              <div className="mt-3">
                {renderCommentForm(comment.id)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
        <MessageSquare className="h-5 w-5" />
        <span>Comments</span>
      </h3>

      {error && (
        <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="mt-4">
        {!replyTo && (
          <div className="mb-6">
            {user ? (
              renderCommentForm()
            ) : (
              <p className="text-gray-600">
                Please sign in to post comments.
              </p>
            )}
          </div>
        )}

        <div className="space-y-1 divide-y divide-gray-100">
          {comments.map(renderComment)}
        </div>

        {comments.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </div>
  );
}