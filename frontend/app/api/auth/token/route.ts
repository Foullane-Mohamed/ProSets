import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Implement session-based token retrieval
  // For now, return null (user is not authenticated)
  return NextResponse.json({ accessToken: null });
}
