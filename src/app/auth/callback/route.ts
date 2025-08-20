import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createClient(cookieStore)
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`)
      }
      
      console.error('Supabase Auth Error:', error.message)
      return NextResponse.redirect(`${origin}/auth/error`)
    } catch (error) {
      console.error('Supabase auth callback error:', error)
      return NextResponse.redirect(`${origin}/auth/error`)
    }
  }

  // return the user to the home page if no code
  return NextResponse.redirect(`${origin}/`)
}