import { NextRequest, NextResponse } from 'next/server';
import { eq, and, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { groupMembers, expenses, users } from '@/lib/schema';
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
      createdAt: expenses.createdAt,
      title: expenses.title,
      category: expenses.category,
      amount: expenses.amount,
      paidByName: users.name,
    })
    .from(expenses)
    .innerJoin(users, eq(users.id, expenses.paidBy))
    .where(eq(expenses.groupId, groupId))
    .orderBy(asc(expenses.createdAt));

  let csv = 'Tanggal,Judul,Kategori,Dibayar Oleh,Nominal\n';
  for (const e of rows) {
    csv += `${e.createdAt},"${e.title}",${e.category},"${e.paidByName}",${e.amount}\n`;
  }

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="laporan-pengeluaran.csv"',
    },
  });
}
