import React from 'react';
import { PostList } from '../components/PostList';

export function Visualizations() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Data Visualizations</h1>
      <PostList type="visualization" />
    </div>
  );
}