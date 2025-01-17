import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart2, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './auth/AuthModal';
import { NewPostModal } from './NewPostModal';
import { supabase } from '../lib/supabase';

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BarChart2 className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Transparency and Progress</h1>
          </div>
          
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="search"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-indigo-300" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button 
                  onClick={() => setShowNewPostModal(true)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors"
                >
                  New Post
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate('/profile')}
                    className="text-white hover:text-indigo-200"
                  >
                    <User className="h-6 w-6" />
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="text-white hover:text-indigo-200"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      <NewPostModal
        isOpen={showNewPostModal}
        onClose={() => setShowNewPostModal(false)}
      />
    </header>
  );
}