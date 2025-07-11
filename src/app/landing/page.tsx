'use client';

import LoginButton from '../components/auth/LoginButton';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function LandingPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              The Bottom Tick
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover financial insights and track your investment journey with powerful analytics and visualization tools.
            </p>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Get Started Today
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Join thousands of investors who use our platform to make informed decisions. 
                Sign in with Google to access your personalized dashboard.
              </p>
              
              <div className="flex justify-center">
                <LoginButton />
              </div>
            </div>
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Financial Analytics</h3>
              <p className="text-gray-600">
                Deep dive into company financials with interactive charts and trend analysis.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Growth & Decline Watchlists</h3>
              <p className="text-gray-600">
                Track your favorite growth stocks and monitor declining positions with custom watchlists.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Insights</h3>
              <p className="text-gray-600">
                Get instant access to market data and financial visualizations that help you make better decisions.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-gray-500">
              © 2025 The Bottom Tick. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
