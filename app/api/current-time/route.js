import { NextResponse } from 'next/server';

export async function GET() {
  const currentTime = new Date(Date.now() - 80000).toISOString();
  return NextResponse.json({ currentTime });
}
