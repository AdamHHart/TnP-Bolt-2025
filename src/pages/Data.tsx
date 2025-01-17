import React from 'react';
import { PostList } from '../components/PostList';

export function Data() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Data Analysis</h1>
      <PostList type="data" />
    </div>
  );
}