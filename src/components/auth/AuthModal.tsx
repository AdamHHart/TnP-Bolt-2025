import React, { useState } from 'react';
import { X } from 'lucide-react';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignIn, setIsSignIn] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-center mb-6">
          {isSignIn ? 'Sign In' : 'Create Account'}
        </h2>
        
        {isSignIn ? <SignInForm onClose={onClose} /> : <SignUpForm onClose={onClose} />}
        
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignIn(!isSignIn)}
            className="text-indigo-600 hover:text-indigo-800"
          >
            {isSignIn ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}