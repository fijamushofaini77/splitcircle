import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { groups, groupMembers } from '@/lib/schema';
import { getSession } from '@/lib/session';

function genInviteCode() {
  return crypto.randomUUID().slice(0, 6).toUpperCase();
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sesi tidak valid atau kedaluwarsa. Silakan login kembali.' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  if (!name) return NextResponse.json({ error: 'Nama grup wajib diisi.' }, { status: 400 });

  const [group] = await db.insert(groups).values({
    name,
    description: body?.description || '',
    inviteCode: genInviteCode(),
    ownerId: session.id,
  }).returning();

  await db.insert(groupMembers).values({ groupId: group.id, userId: session.id });

  return NextResponse.json({ group });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sesi tidak valid atau kedaluwarsa. Silakan login kembali.' }, { status: 401 });

  const rows = await db
    .select({ group: groups })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .where(eq(groupMembers.userId, session.id))
    .orderBy(desc(groups.createdAt));

  return NextResponse.json({ groups: rows.map((r) => r.group) });
}
