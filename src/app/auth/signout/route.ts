import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  // Clear the server session
  await supabase.auth.signOut();

  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/`); // back to homepage
}