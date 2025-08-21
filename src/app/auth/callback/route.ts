import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  if (code) {
    // Exchange the code for a session quickly
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to the home page immediately
  return NextResponse.redirect(`${url.origin}/`);
}