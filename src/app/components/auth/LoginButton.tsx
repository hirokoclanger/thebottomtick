'use client';

import { useAuth } from '../../../contexts/AuthContext';
import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';

export default function LoginButton() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className="flex items-center justify-center gap-3 w-full max-w-md px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FcGoogle className="w-5 h-5" />
      <span className="text-gray-700 font-medium">
        {isLoading ? 'Signing in...' : 'Continue with Google'}
      </span>
    </button>
  );
}
