import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { expenses, expenseShares, groupMembers, users, activityLog } from '@/lib/schema';
import { getSession } from '@/lib/session';

async function isMember(groupId: string, userId: string) {
  const row = await db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)),
  });
  return !!row;
}

async function logActivity(groupId: string, userId: string, action: string, detail?: string) {
  await db.insert(activityLog).values({ groupId, userId, action, detail: detail || null });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sesi tidak valid atau kedaluwarsa. Silakan login kembali.' }, { status: 401 });

  const { groupId } = await params;
  if (!(await isMember(groupId, session.id))) {
    return NextResponse.json({ error: 'Kamu bukan anggota grup ini.' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const { title, amount, category, split_method, note, shares } = body || {};

  if (!title || !amount || Number(amount) <= 0) {
    return NextResponse.json({ error: 'Judul dan nominal pengeluaran wajib diisi dengan benar.' }, { status: 400 });
  }

  const memberRows = await db.query.groupMembers.findMany({ where: eq(groupMembers.groupId, groupId) });
  const memberIds = memberRows.map((m) => m.userId);
  const amt = Number(amount);
  let finalShares: Record<string, number> = {};

  if (split_method === 'custom' && shares && Object.keys(shares).length > 0) {
    const sum = Object.values(shares).reduce((a: number, b) => a + Number(b), 0);
    if (Math.abs(sum - amt) > 0.5) {
      return NextResponse.json({ error: 'Total pembagian custom harus sama dengan nominal total.' }, { status: 400 });
    }
    finalShares = shares;
  } else if (split_method === 'percentage' && shares && Object.keys(shares).length > 0) {
    const sumPct = Object.values(shares).reduce((a: number, b) => a + Number(b), 0);
    if (Math.abs(sumPct - 100) > 0.5) {
      return NextResponse.json({ error: 'Total persentase harus 100%.' }, { status: 400 });
    }
    for (const uid of Object.keys(shares)) {
      finalShares[uid] = Math.round(amt * (Number(shares[uid]) / 100) * 100) / 100;
    }
  } else {
    const equalShare = Math.round((amt / memberIds.length) * 100) / 100;
    memberIds.forEach((uid, idx) => {
      finalShares[uid] = idx === memberIds.length - 1
        ? Math.round((amt - equalShare * (memberIds.length - 1)) * 100) / 100
        : equalShare;
    });
  }

  const [expense] = await db.insert(expenses).values({
    groupId,
    paidBy: session.id,
    title: title.trim(),
    amount: String(amt),
    category: category || 'Umum',
    splitMethod: split_method || 'equal',
    note: note || '',
  }).returning();

  for (const [uid, shareAmt] of Object.entries(finalShares)) {
    await db.insert(expenseShares).values({ expenseId: expense.id, userId: uid, shareAmount: String(shareAmt) });
  }

  await logActivity(groupId, session.id, 'expense_added', `${title.trim()} - Rp${amt.toLocaleString('id-ID')}`);

  return NextResponse.json({ expenseId: expense.id });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sesi tidak valid atau kedaluwarsa. Silakan login kembali.' }, { status: 401 });

  const { groupId } = await params;
  if (!(await isMember(groupId, session.id))) {
    return NextResponse.json({ error: 'Kamu bukan anggota grup ini.' }, { status: 403 });
  }

  const rows = await db
    .select({
      id: expenses.id,
      title: expenses.title,
      amount: expenses.amount,
      category: expenses.category,
      splitMethod: expenses.splitMethod,
      note: expenses.note,
      createdAt: expenses.createdAt,
      paidBy: expenses.paidBy,
      paidByName: users.name,
    })
    .from(expenses)
    .innerJoin(users, eq(users.id, expenses.paidBy))
    .where(eq(expenses.groupId, groupId))
    .orderBy(desc(expenses.createdAt));

  const withShares = await Promise.all(
    rows.map(async (e) => {
      const shares = await db
        .select({ userId: expenseShares.userId, shareAmount: expenseShares.shareAmount, name: users.name })
        .from(expenseShares)
        .innerJoin(users, eq(users.id, expenseShares.userId))
        .where(eq(expenseShares.expenseId, e.id));
      return { ...e, shares };
    })
  );

  return NextResponse.json({ expenses: withShares });
}
