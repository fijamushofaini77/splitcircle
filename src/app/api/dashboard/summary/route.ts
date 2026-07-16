import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { groupMembers, expenses, settlements } from '@/lib/schema';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sesi tidak valid atau kedaluwarsa. Silakan login kembali.' }, { status: 401 });

  const memberships = await db.query.groupMembers.findMany({ where: eq(groupMembers.userId, session.id) });
  const groupIds = memberships.map((m) => m.groupId);

  let totalExpenses = 0;
  let expenseCount = 0;
  for (const gid of groupIds) {
    const rows = await db.query.expenses.findMany({ where: eq(expenses.groupId, gid) });
    expenseCount += rows.length;
    totalExpenses += rows.reduce((sum, e) => sum + Number(e.amount), 0);
  }

  let pendingIncoming = 0;
  for (const gid of groupIds) {
    const rows = await db.query.settlements.findMany({
      where: and(eq(settlements.groupId, gid), eq(settlements.status, 'pending')),
    });
    pendingIncoming += rows.filter((s) => s.toUser === session.id).length;
  }

  return NextResponse.json({
    totalGroups: groupIds.length,
    totalExpenses,
    expenseCount,
    pendingIncoming,
  });
}
