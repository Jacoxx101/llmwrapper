"use client";

export default function SupabaseProbe() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  const allConfigured = Object.values(envVars).every(Boolean);

  return (
    <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
      <h3 className="font-semibold mb-2">Supabase Client Configuration</h3>
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