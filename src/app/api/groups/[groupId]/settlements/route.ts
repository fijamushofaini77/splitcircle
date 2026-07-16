import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { groupMembers, settlements, users, activityLog } from '@/lib/schema';
import { getSession } from '@/lib/session';
import { alias } from 'drizzle-orm/pg-core';

export async function POST(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sesi tidak valid atau kedaluwarsa. Silakan login kembali.' }, { status: 401 });

  const { groupId } = await params;
  const membership = await db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, session.id)),
  });
  if (!membership) return NextResponse.json({ error: 'Kamu bukan anggota grup ini.' }, { status: 403 });

  const body = await req.json().catch(() => null);
  const { to_user, amount } = body || {};
  if (!to_user || !amount || Number(amount) <= 0) {
    return NextResponse.json({ error: 'Tujuan dan nominal pembayaran wajib diisi.' }, { status: 400 });
  }

  const [row] = await db.insert(settlements).values({
    groupId, fromUser: session.id, toUser: to_user, amount: String(amount), status: 'pending',
  }).returning();

  await db.insert(activityLog).values({
    groupId, userId: session.id, action: 'settlement_requested',
    detail: `Mengajukan pembayaran Rp${Number(amount).toLocaleString('id-ID')}`,
  });

  return NextResponse.json({ settlementId: row.id });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sesi tidak valid atau kedaluwarsa. Silakan login kembali.' }, { status: 401 });

  const { groupId } = await params;
  const membership = await db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, session.id)),
  });
  if (!membership) return NextResponse.json({ error: 'Kamu bukan anggota grup ini.' }, { status: 403 });

  const fromUsers = alias(users, 'from_users');
  const toUsers = alias(users, 'to_users');

  const rows = await db
    .select({
      id: settlements.id,
      amount: settlements.amount,
      status: settlements.status,
      createdAt: settlements.createdAt,
      confirmedAt: settlements.confirmedAt,
      fromUser: settlements.fromUser,
      toUser: settlements.toUser,
      from_name: fromUsers.name,
      to_name: toUsers.name,
    })
    .from(settlements)
    .innerJoin(fromUsers, eq(fromUsers.id, settlements.fromUser))
    .innerJoin(toUsers, eq(toUsers.id, settlements.toUser))
    .where(eq(settlements.groupId, groupId))
    .orderBy(desc(settlements.createdAt));

  return NextResponse.json({ settlements: rows });
}
