import React from 'react';
import { PostList } from '../components/PostList';

export function Home() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Recent Discussions</h1>
        <select className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700">
          <option>Most Recent</option>
          <option>Most Voted</option>
          <option>Most Discussed</option>
        </select>
      </div>

      <PostList />
    </div>
  );
}