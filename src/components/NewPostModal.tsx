import React from 'react';
import { X } from 'lucide-react';
import { NewPostForm } from './NewPostForm';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewPostModal({ isOpen, onClose }: NewPostModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 relative flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
          
          <h2 className="text-2xl font-bold text-center">
            Create New Post
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <NewPostForm onClose={onClose} />
        </div>
      </div>
    </div>
  );
}