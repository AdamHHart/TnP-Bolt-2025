import React from 'react';
import { PostCard } from './PostCard';
import { usePosts } from '../hooks/usePosts';

interface PostListProps {
  type?: string;
}

export function PostList({ type }: PostListProps) {
  const { posts, loading, error, vote } = usePosts(type);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">No posts yet. Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <PostCard key={post.id} post={post} onVote={vote} />
      ))}
    </div>
  );
}