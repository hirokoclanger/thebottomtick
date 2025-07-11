'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Redirect to landing page if authentication is required but user is not signed in
        router.push('/landing');
      } else if (!requireAuth && user) {
        // Redirect to dashboard if user is signed in but trying to access public-only pages
        router.push('/dashboard');
      }
    }
  }, [user, loading, requireAuth, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If requireAuth is true and user is not authenticated, don't render children
  if (requireAuth && !user) {
    return null;
  }

  // If requireAuth is false and user is authenticated, don't render children
  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
}
