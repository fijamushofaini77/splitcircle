import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { groupMembers, users, expenses, expenseShares, settlements } from '@/lib/schema';
import { getSession } from '@/lib/session';
import { simplifyDebts } from '@/lib/debtEngine';

export async function GET(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sesi tidak valid atau kedaluwarsa. Silakan login kembali.' }, { status: 401 });

  const { groupId } = await params;
  const membership = await db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, session.id)),
  });
  if (!membership) return NextResponse.json({ error: 'Kamu bukan anggota grup ini.' }, { status: 403 });

  const members = await db
    .select({ id: users.id, name: users.name, avatar_color: users.avatarColor })
    .from(groupMembers)
    .innerJoin(users, eq(users.id, groupMembers.userId))
    .where(eq(groupMembers.groupId, groupId));

  const balances: Record<string, number> = {};
  members.forEach((m) => { balances[m.id] = 0; });

  const groupExpenses = await db.query.expenses.findMany({ where: eq(expenses.groupId, groupId) });

  for (const e of groupExpenses) {
    balances[e.paidBy] = (balances[e.paidBy] || 0) + Number(e.amount);
    const shares = await db.query.expenseShares.findMany({ where: eq(expenseShares.expenseId, e.id) });
    for (const s of shares) {
      balances[s.userId] = (balances[s.userId] || 0) - Number(s.shareAmount);
    }
  }

  const confirmed = await db.query.settlements.findMany({
    where: and(eq(settlements.groupId, groupId), eq(settlements.status, 'confirmed')),
  });
  for (const s of confirmed) {
    balances[s.fromUser] = (balances[s.fromUser] || 0) + Number(s.amount);
    balances[s.toUser] = (balances[s.toUser] || 0) - Number(s.amount);
  }

  const transactions = simplifyDebts(balances);
  const nameMap = Object.fromEntries(members.map((m) => [m.id, m]));

  const enrichedTx = transactions.map((t) => ({
    ...t,
    from_name: nameMap[t.from]?.name,
    to_name: nameMap[t.to]?.name,
  }));

  const balanceList = members.map((m) => ({
    ...m,
    balance: Math.round((balances[m.id] || 0) * 100) / 100,
  }));

  return NextResponse.json({ balances: balanceList, suggestedTransactions: enrichedTx });
}
