import React from 'react';
import { PostList } from '../components/PostList';

export function Polls() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Public Opinion Polls</h1>
      <PostList type="poll" />
    </div>
  );
}