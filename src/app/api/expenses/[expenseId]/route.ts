import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { expenses, groupMembers, activityLog } from '@/lib/schema';
import { getSession } from '@/lib/session';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ expenseId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sesi tidak valid atau kedaluwarsa. Silakan login kembali.' }, { status: 401 });

  const { expenseId } = await params;
  const expense = await db.query.expenses.findFirst({ where: eq(expenses.id, expenseId) });
  if (!expense) return NextResponse.json({ error: 'Pengeluaran tidak ditemukan.' }, { status: 404 });

  const isMember = await db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.groupId, expense.groupId), eq(groupMembers.userId, session.id)),
  });
  if (!isMember) return NextResponse.json({ error: 'Kamu bukan anggota grup ini.' }, { status: 403 });

  if (expense.paidBy !== session.id) {
    return NextResponse.json({ error: 'Hanya pembuat pengeluaran yang dapat menghapusnya.' }, { status: 403 });
  }

  await db.delete(expenses).where(eq(expenses.id, expenseId));
  await db.insert(activityLog).values({
    groupId: expense.groupId,
    userId: session.id,
    action: 'expense_deleted',
    detail: `${expense.title} dihapus`,
  });

  return NextResponse.json({ ok: true });
}
