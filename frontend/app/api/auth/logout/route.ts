import { NextResponse } from 'next/server';

export async function GET() {
  // Clear session and redirect to home
  const response = NextResponse.redirect(new URL('/', process.env.AUTH0_BASE_URL || 'http://localhost:3000'));
  
  // Clear Auth0 session cookies
  response.cookies.delete('appSession');
  
  return response;
}
