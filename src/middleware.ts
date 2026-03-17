import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_EXACT = ['/'];
const PUBLIC_PREFIX = ['/login', '/api/auth'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes and Next.js internals
  if (PUBLIC_EXACT.includes(pathname)) return NextResponse.next();
  if (PUBLIC_PREFIX.some(p => pathname.startsWith(p))) return NextResponse.next();

  const uid = req.cookies.get('sf_uid')?.value;
  if (!uid) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
