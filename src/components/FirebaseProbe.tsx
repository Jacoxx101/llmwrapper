"use client";

export default function FirebaseProbe() {
  const envVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const allConfigured = Object.values(envVars).every(Boolean);

  return (
    <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
      <h3 className="font-semibold mb-2">Firebase Client Configuration</h3>
      <div className="text-sm">
        <div className="mb-2">
          <span className={`px-2 py-1 rounded text-xs ${allConfigured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Client Config: {allConfigured ? 'COMPLETE' : 'MISSING'}
          </span>
        </div>
        <pre className="text-xs">
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </div>
    </div>
  );
}