import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { settlements, activityLog } from '@/lib/schema';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest, { params }: { params: Promise<{ settlementId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sesi tidak valid atau kedaluwarsa. Silakan login kembali.' }, { status: 401 });

  const { settlementId } = await params;
  const settlement = await db.query.settlements.findFirst({ where: eq(settlements.id, settlementId) });
  if (!settlement) return NextResponse.json({ error: 'Data pembayaran tidak ditemukan.' }, { status: 404 });
  if (settlement.toUser !== session.id) {
    return NextResponse.json({ error: 'Hanya penerima pembayaran yang dapat mengonfirmasi.' }, { status: 403 });
  }
  if (settlement.status !== 'pending') {
    return NextResponse.json({ error: 'Pembayaran ini sudah diproses sebelumnya.' }, { status: 409 });
  }

  await db.update(settlements)
    .set({ status: 'confirmed', confirmedAt: new Date() })
    .where(eq(settlements.id, settlementId));

  await db.insert(activityLog).values({
    groupId: settlement.groupId, userId: session.id, action: 'settlement_confirmed',
    detail: `Pembayaran Rp${Number(settlement.amount).toLocaleString('id-ID')} dikonfirmasi`,
  });

  return NextResponse.json({ ok: true });
}
