import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { groups, groupMembers, users } from '@/lib/schema';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sesi tidak valid atau kedaluwarsa. Silakan login kembali.' }, { status: 401 });

  const { groupId } = await params;

  const isMember = await db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, session.id)),
  });
  if (!isMember) return NextResponse.json({ error: 'Kamu bukan anggota grup ini.' }, { status: 403 });

  const group = await db.query.groups.findFirst({ where: eq(groups.id, groupId) });

  const members = await db
    .select({ id: users.id, name: users.name, email: users.email, avatar_color: users.avatarColor })
    .from(groupMembers)
    .innerJoin(users, eq(users.id, groupMembers.userId))
    .where(eq(groupMembers.groupId, groupId));

  return NextResponse.json({ group, members });
}
