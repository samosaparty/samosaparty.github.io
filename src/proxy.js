import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || 'super-secret-admin-analysis-key-12345'
);

const publicRoutes = ['/login', '/register'];

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  
  const isPublicRoute = publicRoutes.includes(pathname);
  
  const token = request.cookies.get('session')?.value;
  
  // Verify token
  let session = null;
  if (token) {
    try {
      const verified = await jwtVerify(token, SECRET_KEY);
      session = verified.payload;
    } catch (err) {
      session = null;
    }
  }

  // Redirect logic
  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (pathname === '/') {
    return NextResponse.redirect(new URL(session ? '/dashboard' : '/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
