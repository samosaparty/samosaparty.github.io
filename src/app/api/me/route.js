import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  if (!token) {
    return NextResponse.json({ user: null });
  }
  
  const payload = await verifySession(token);
  return NextResponse.json({ user: payload });
}
