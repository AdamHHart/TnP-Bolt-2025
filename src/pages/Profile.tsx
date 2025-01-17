import React, { useState, useEffect } from 'react';
import { User, MapPin, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UserProfile {
  username: string;
  avatar: string | null;
  province: string | null;
  joined_at: string;
  reputation: number;
}

export function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    province: '',
    avatar: ''
  });

  const provinces = [
    'Alberta',
    'British Columbia',
    'Manitoba',
    'New Brunswick',
    'Newfoundland and Labrador',
    'Nova Scotia',
    'Ontario',
    'Prince Edward Island',
    'Quebec',
    'Saskatchewan',
    'Northwest Territories',
    'Nunavut',
    'Yukon'
  ];

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      setError('');
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new Error('Profile not found. Please complete your profile.');
        }
        throw fetchError;
      }

      if (!data) {
        throw new Error('Profile not found. Please sign out and sign in again.');
      }

      setProfile(data);
      setFormData({
        username: data.username || '',
        province: data.province || '',
        avatar: data.avatar || ''
      });
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Check if username is taken (if changed)
      if (formData.username !== profile?.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('username', formData.username)
          .neq('id', user.id)
          .maybeSingle();

        if (checkError) throw checkError;
        if (existingUser) {
          throw new Error('Username is already taken');
        }
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: formData.username,
          province: formData.province || null,
          avatar: formData.avatar || null
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      await fetchProfile();
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch {
      return 'Unknown';
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Please sign in to view your profile.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <div className="bg-red-50 text-red-600 p-6 rounded-lg">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
          {error.includes('complete your profile') && (
            <div className="mt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Complete Profile
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              minLength={3}
              maxLength={30}
              pattern="^[a-zA-Z0-9_-]+$"
            />
          </div>

          <div>
            <label htmlFor="province" className="block text-sm font-medium text-gray-700">
              Province
            </label>
            <select
              id="province"
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select a province</option>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
              Avatar URL
            </label>
            <input
              id="avatar"
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : profile && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="h-10 w-10 text-indigo-600" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">{profile.username}</h2>
                <p className="text-gray-500">Reputation: {profile.reputation}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="h-5 w-5" />
                <span>{user.email}</span>
              </div>
              {profile.province && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-5 w-5" />
                  <span>{profile.province}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-5 w-5" />
                <span>Joined {formatDate(profile.joined_at)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}