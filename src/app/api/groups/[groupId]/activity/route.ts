import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { groupMembers, activityLog, users } from '@/lib/schema';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sesi tidak valid atau kedaluwarsa. Silakan login kembali.' }, { status: 401 });

  const { groupId } = await params;
  const membership = await db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, session.id)),
  });
  if (!membership) return NextResponse.json({ error: 'Kamu bukan anggota grup ini.' }, { status: 403 });

  const rows = await db
    .select({
      id: activityLog.id,
      action: activityLog.action,
      detail: activityLog.detail,
      createdAt: activityLog.createdAt,
      userName: users.name,
    })
    .from(activityLog)
    .innerJoin(users, eq(users.id, activityLog.userId))
    .where(eq(activityLog.groupId, groupId))
    .orderBy(desc(activityLog.createdAt))
    .limit(50);

  return NextResponse.json({ activity: rows });
}
