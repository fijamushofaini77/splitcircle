import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { registerSchema } from '@/lib/validators';

const AVATAR_COLORS = ['#7a2e3a', '#c98a2c', '#3a6b5c', '#5a4a8a', '#2c6b8f', '#a8452f'];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await db.query.users.findFirst({ where: eq(users.email, normalizedEmail) });
  if (existing) {
    return NextResponse.json({ error: 'Email sudah terdaftar. Silakan login.' }, { status: 409 });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  const [row] = await db
    .insert(users)
    .values({ name: name.trim(), email: normalizedEmail, passwordHash, avatarColor })
    .returning();

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
