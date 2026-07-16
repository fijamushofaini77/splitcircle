import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { groups, groupMembers } from '@/lib/schema';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sesi tidak valid atau kedaluwarsa. Silakan login kembali.' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const inviteCode = body?.invite_code?.trim().toUpperCase();
  if (!inviteCode) return NextResponse.json({ error: 'Kode undangan wajib diisi.' }, { status: 400 });

  const group = await db.query.groups.findFirst({ where: eq(groups.inviteCode, inviteCode) });
  if (!group) return NextResponse.json({ error: 'Kode undangan tidak ditemukan.' }, { status: 404 });

  const already = await db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.groupId, group.id), eq(groupMembers.userId, session.id)),
  });
  if (already) return NextResponse.json({ error: 'Kamu sudah menjadi anggota grup ini.' }, { status: 409 });

  await db.insert(groupMembers).values({ groupId: group.id, userId: session.id });

  return NextResponse.json({ group });
}
