import React, { useState } from 'react';
import { Image, BarChart2, FileText, PieChart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const POST_TYPES = [
  { id: 'study', icon: FileText, label: 'Study' },
  { id: 'poll', icon: PieChart, label: 'Poll' },
  { id: 'data', icon: BarChart2, label: 'Data' },
  { id: 'visualization', icon: Image, label: 'Visualization' }
] as const;

interface PollOption {
  text: string;
  id: string;
}

export function NewPostForm({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'study' | 'poll' | 'data' | 'visualization'>('study');
  const [imageUrl, setImageUrl] = useState('');
  const [source, setSource] = useState('');
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { text: '', id: '1' },
    { text: '', id: '2' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');

    try {
      // First check if the user exists in the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        throw new Error('Please complete your profile before posting');
      }

      const postData = {
        title,
        content: type === 'poll' ? JSON.stringify(pollOptions) : content,
        type,
        author_id: user.id,
        image_url: imageUrl || null,
        source: source || null,
        votes: 0
      };

      const { error: postError } = await supabase
        .from('posts')
        .insert([postData]);

      if (postError) throw postError;
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, { text: '', id: Date.now().toString() }]);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {POST_TYPES.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setType(id)}
            className={`p-4 rounded-lg border ${
              type === id 
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Icon className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        {type !== 'poll' ? (
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Poll Options
            </label>
            {pollOptions.map((option, index) => (
              <input
                key={option.id}
                type="text"
                value={option.text}
                onChange={(e) => {
                  const newOptions = [...pollOptions];
                  newOptions[index].text = e.target.value;
                  setPollOptions(newOptions);
                }}
                placeholder={`Option ${index + 1}`}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            ))}
            {pollOptions.length < 6 && (
              <button
                type="button"
                onClick={addPollOption}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                + Add Option
              </button>
            )}
          </div>
        )}

        {(type === 'visualization' || type === 'data') && (
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700">
            Source URL (optional)
          </label>
          <input
            id="source"
            type="url"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end space-x-3 sticky bottom-0 pt-4 bg-white border-t border-gray-200 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
}