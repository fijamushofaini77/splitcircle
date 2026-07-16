"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

type Expense = {
  id: string;
  title: string;
  amount: string;
  category: string | null;
  paidByName: string;
  createdAt: string;
};

const CATEGORY_ICONS: Record<string, string> = {
  Umum: "solar:wallet-bold",
  Makanan: "solar:chef-hat-bold",
  Transportasi: "solar:bus-bold",
  Hiburan: "solar:gameboy-bold",
  Tagihan: "solar:bill-list-bold",
  Belanja: "solar:bag-4-bold",
};

export function ExpenseList({
  expenses,
  currentUserId,
  onDeleted,
}: {
  expenses: Expense[];
  currentUserId: string;
  onDeleted: () => void;
}) {
  async function handleDelete(id: string) {
    if (!confirm("Hapus pengeluaran ini?")) return;
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    onDeleted();
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-14">
        <div className="w-14 h-14 rounded-full bg-[var(--rose-50)] flex items-center justify-center mx-auto mb-4">
          <Icon icon="solar:bill-list-bold" className="text-2xl text-[var(--rose-400)]" />
        </div>
        <p className="text-sm font-medium text-[var(--maroon-dark)]">Belum ada pengeluaran</p>
        <p className="text-xs text-muted-foreground mt-1">
          Klik &ldquo;Tambah Pengeluaran&rdquo; untuk mulai mencatat.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--rose-100)]">
      {expenses.map((e) => (
        <div key={e.id} className="flex items-center gap-3.5 py-3.5 px-2 -mx-2 rounded-xl hover:bg-[var(--rose-50)]/50 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[var(--rose-50)] flex items-center justify-center text-lg text-[var(--rose-400)] shrink-0">
            <Icon icon={CATEGORY_ICONS[e.category || "Umum"] || "solar:wallet-bold"} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">{e.title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Dibayar oleh {e.paidByName} &middot;{" "}
              {new Date(e.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
            </div>
          </div>
          <div className="font-semibold text-sm text-[var(--maroon-dark)]">
            Rp{Number(e.amount).toLocaleString("id-ID")}
          </div>
          {e.paidByName && (
            <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)} title="Hapus">
              <Icon icon="solar:trash-bin-trash-bold" className="text-red-500" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
