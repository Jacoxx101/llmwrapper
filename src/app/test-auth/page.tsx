'use client';

import { useAuth } from '@/contexts/SupabaseAuthContext';

export default function TestAuth() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div className="p-4">Loading auth state...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <strong>User Status:</strong> {user ? 'Signed In' : 'Not Signed In'}
        </div>
        
        {user && (
          <div>
            <strong>User Info:</strong>
            <pre className="bg-gray-100 p-2 rounded mt-2">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}
        
        {user && (
          <div className="space-y-2">
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mr-2"
            >
              Test Logout (Context)
            </button>
            <a
              href="/auth/signout"
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 inline-block"
            >
              Test Direct Logout (Link)
            </a>
          </div>
        )}
        
        <div>
          <a href="/" className="text-blue-500 underline">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}