import { NextResponse } from 'next/server';

export async function GET() {
  // Redirect to Auth0 login
  const baseUrl = process.env.AUTH0_BASE_URL || 'http://localhost:3000';
  const issuerBaseUrl = process.env.AUTH0_ISSUER_BASE_URL;
  const clientId = process.env.AUTH0_CLIENT_ID;
  
  if (!issuerBaseUrl || !clientId) {
    return NextResponse.json({ error: 'Auth0 not configured' }, { status: 500 });
  }
  
  const authUrl = `${issuerBaseUrl}/authorize?` + new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: `${baseUrl}/api/auth/callback`,
    scope: 'openid profile email',
  });
  
  return NextResponse.redirect(authUrl);
}
