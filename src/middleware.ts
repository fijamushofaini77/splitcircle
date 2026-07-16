import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = 'sc_token';

const PUBLIC_PATHS = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const token = req.cookies.get(COOKIE_NAME)?.value;

  let isAuthed = false;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isAuthed = true;
    } catch {
      isAuthed = false;
    }
  }

  if (!isAuthed && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (isAuthed && isPublic) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
