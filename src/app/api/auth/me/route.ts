import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Sesi tidak valid atau kedaluwarsa. Silakan login kembali.' }, { status: 401 });
  }
  const row = await db.query.users.findFirst({
    where: eq(users.id, session.id),
    columns: { id: true, name: true, email: true, avatarColor: true },
  });
  if (!row) return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ user: row });
}
