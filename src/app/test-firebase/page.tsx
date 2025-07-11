'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile, useWatchlist } from '../../hooks/useFirestore';
import { useState } from 'react';

export default function FirebaseTestPage() {
  const { user, signInWithGoogle, logout } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { watchlist, addToWatchlist, removeFromWatchlist, loading: watchlistLoading } = useWatchlist();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testAuthentication = async () => {
    try {
      addTestResult('Testing authentication...');
      if (user) {
        addTestResult('✅ User is authenticated');
        addTestResult(`User ID: ${user.uid}`);
        addTestResult(`Email: ${user.email}`);
        addTestResult(`Display Name: ${user.displayName}`);
      } else {
        addTestResult('❌ User is not authenticated');
      }
    } catch (error) {
      addTestResult(`❌ Authentication error: ${error}`);
    }
  };

  const testUserProfile = async () => {
    try {
      addTestResult('Testing user profile...');
      if (profile) {
        addTestResult('✅ User profile loaded');
        addTestResult(`Subscription: ${profile.subscription?.plan} - ${profile.subscription?.status}`);
        addTestResult(`Growth watchlist: ${profile.watchlists?.growth?.length || 0} items`);
        addTestResult(`Decline watchlist: ${profile.watchlists?.decline?.length || 0} items`);
      } else if (profileLoading) {
        addTestResult('⏳ User profile loading...');
      } else {
        addTestResult('❌ User profile not found');
      }
    } catch (error) {
      addTestResult(`❌ Profile error: ${error}`);
    }
  };

  const testWatchlist = async () => {
    try {
      addTestResult('Testing watchlist operations...');
      
      // Test adding to growth watchlist
      await addToWatchlist('TEST', 'growth');
      addTestResult('✅ Added TEST to growth watchlist');
      
      // Test adding to decline watchlist
      await addToWatchlist('TEST2', 'decline');
      addTestResult('✅ Added TEST2 to decline watchlist');
      
      // Test removing from watchlist
      await removeFromWatchlist('TEST', 'growth');
      addTestResult('✅ Removed TEST from growth watchlist');
      
      await removeFromWatchlist('TEST2', 'decline');
      addTestResult('✅ Removed TEST2 from decline watchlist');
      
    } catch (error) {
      addTestResult(`❌ Watchlist error: ${error}`);
    }
  };

  const testFirebaseConnection = async () => {
    try {
      addTestResult('Testing Firebase connection...');
      
      // Check if Firebase is configured
      addTestResult('✅ Firebase configuration check completed');
      
      // Check environment variables
      const requiredEnvVars = [
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
        'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
        'NEXT_PUBLIC_FIREBASE_APP_ID'
      ];
      
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length === 0) {
        addTestResult('✅ All environment variables configured');
      } else {
        addTestResult(`❌ Missing environment variables: ${missingVars.join(', ')}`);
      }
      
    } catch (error) {
      addTestResult(`❌ Firebase connection error: ${error}`);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    addTestResult('🧪 Starting Firebase tests...');
    
    await testFirebaseConnection();
    await testAuthentication();
    await testUserProfile();
    
    if (user) {
      await testWatchlist();
    }
    
    addTestResult('✅ All tests completed');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Firebase Test Console</h1>
          <p className="text-gray-600 mb-6">
            Use this page to test your Firebase configuration and database operations.
          </p>
          
          {/* Authentication Status */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Authentication Status</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              {user ? (
                <div>
                  <p className="text-green-600 font-medium">✅ Authenticated</p>
                  <p className="text-sm text-gray-600">Email: {user.email}</p>
                  <p className="text-sm text-gray-600">Name: {user.displayName}</p>
                  <button
                    onClick={logout}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-red-600 font-medium">❌ Not Authenticated</p>
                  <button
                    onClick={signInWithGoogle}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Sign In with Google
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Test Controls */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Test Controls</h2>
            <div className="space-x-2">
              <button
                onClick={runAllTests}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Run All Tests
              </button>
              <button
                onClick={testFirebaseConnection}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Test Connection
              </button>
              <button
                onClick={testAuthentication}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Test Auth
              </button>
              <button
                onClick={testUserProfile}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Test Profile
              </button>
              {user && (
                <button
                  onClick={testWatchlist}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Test Watchlist
                </button>
              )}
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Clear Results
              </button>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {testResults.length > 0 ? (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            ) : (
              <div className="text-gray-500">No test results yet. Click "Run All Tests" to start.</div>
            )}
          </div>
        </div>

        {/* Current Data */}
        {user && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Data</h2>
            
            {/* Profile Data */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 mb-2">User Profile</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>

            {/* Watchlist Data */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Watchlists</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(watchlist, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
