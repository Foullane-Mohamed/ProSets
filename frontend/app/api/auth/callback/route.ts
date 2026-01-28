import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Handle Auth0 callback
  // For now, just redirect to home
  // TODO: Exchange code for tokens and create session
  
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  
  if (error) {
    console.error('Auth0 callback error:', error);
    return NextResponse.redirect(new URL('/?error=auth_failed', process.env.AUTH0_BASE_URL || 'http://localhost:3000'));
  }
  
  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', process.env.AUTH0_BASE_URL || 'http://localhost:3000'));
  }
  
  // TODO: Exchange code for tokens and create session
  console.log('Auth0 callback received code:', code);
  
  return NextResponse.redirect(new URL('/', process.env.AUTH0_BASE_URL || 'http://localhost:3000'));
}
