"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

function CallbackHandler() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    const code = sp.get("code");
    const error = sp.get("error") || sp.get("error_description");

    if (error) {
      console.error("OAuth error:", error);
      router.replace("/?auth_error=" + encodeURIComponent(error));
      return;
    }

    if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) console.error("Exchange error:", error.message);
        })
        .finally(() => router.replace("/")); // redirect back to home
    } else {
      router.replace("/");
    }
  }, [sp, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-chat-bg">
      <p className="px-4 py-6 text-sm text-zinc-400">Signing you in…</p>
    </div>
  );
}

export default function Callback() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-chat-bg">
        <p className="px-4 py-6 text-sm text-zinc-400">Loading…</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}