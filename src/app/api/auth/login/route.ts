import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { loginSchema } from '@/lib/validators';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const row = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
  if (!row || !bcrypt.compareSync(password, row.passwordHash)) {
    return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 });
  }

  const sessionUser = { id: row.id, name: row.name, email: row.email };
  const token = await signToken(sessionUser);

  const res = NextResponse.json({ user: { ...sessionUser, avatar_color: row.avatarColor } });
  res.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
