"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Member = { id: string; name: string };

const CATEGORIES = ["Umum", "Makanan", "Transportasi", "Hiburan", "Tagihan", "Belanja"];

export function ExpenseForm({
  groupId,
  members,
  onAdded,
}: {
  groupId: string;
  members: Member[];
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Umum");
  const [splitMethod, setSplitMethod] = useState<"equal" | "custom" | "percentage">("equal");
  const [note, setNote] = useState("");
  const [customShares, setCustomShares] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setTitle(""); setAmount(""); setCategory("Umum"); setSplitMethod("equal");
    setNote(""); setCustomShares({}); setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload: any = {
        title, amount: Number(amount), category, split_method: splitMethod, note,
      };
      if (splitMethod !== "equal") {
        payload.shares = Object.fromEntries(
          Object.entries(customShares).filter(([, v]) => v !== "" && v !== undefined)
        );
      }
      const res = await fetch(`/api/groups/${groupId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Gagal menambah pengeluaran.");
      setOpen(false);
      resetForm();
      onAdded();
    } finally {
      setLoading(false);
    }
  }

  const totalCustom = Object.values(customShares).reduce((a, b) => a + (Number(b) || 0), 0);

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger className="inline-flex items-center gap-1.5 rounded-md bg-[var(--rose-400)] text-white text-sm font-medium px-3 py-1.5 hover:bg-[var(--rose-300)] active:scale-[0.97] transition-all">
        <Icon icon="solar:add-circle-bold" className="text-base" />
        Tambah Pengeluaran
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[var(--maroon-dark)]">Tambah Pengeluaran</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Judul</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Makan malam bareng" required />
          </div>

          <div className="space-y-1.5">
            <Label>Nominal</Label>
            <CurrencyInput
              value={amount}
              onValueChange={(raw) => setAmount(raw)}
              placeholder="150.000"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Kategori</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Metode Split</Label>
            <div className="flex gap-2">
              {(["equal", "custom", "percentage"] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setSplitMethod(m)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                    splitMethod === m
                      ? "bg-[var(--rose-400)] text-white border-[var(--rose-400)]"
                      : "bg-white text-muted-foreground border-input"
                  }`}
                >
                  {m === "equal" ? "Rata" : m === "custom" ? "Custom" : "Persen"}
                </button>
              ))}
            </div>
          </div>

          {splitMethod !== "equal" && (
            <div className="space-y-2 border border-[var(--rose-100)] rounded-lg p-3 bg-[var(--rose-50)]">
              <p className="text-xs text-muted-foreground">
                {splitMethod === "custom"
                  ? `Total harus = Rp${Number(amount || 0).toLocaleString("id-ID")}`
                  : "Total persentase harus 100%"}
              </p>
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <span className="text-sm flex-1">{m.name}</span>
                  {splitMethod === "percentage" ? (
                    <Input
                      type="number"
                      className="w-24"
                      placeholder="%"
                      value={customShares[m.id] || ""}
                      onChange={(e) => setCustomShares((s) => ({ ...s, [m.id]: e.target.value }))}
                    />
                  ) : (
                    <div className="w-32">
                      <CurrencyInput
                        value={customShares[m.id] || ""}
                        onValueChange={(raw) => setCustomShares((s) => ({ ...s, [m.id]: raw }))}
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>
              ))}
              {splitMethod === "custom" && (
                <p className="text-xs text-right text-muted-foreground">
                  Total: Rp{totalCustom.toLocaleString("id-ID")}
                </p>
              )}
              <p className="text-xs text-right text-[var(--maroon-dark)] font-medium">
                Nominal: Rp{Number(amount || 0).toLocaleString("id-ID")}
              </p>
              {splitMethod === "percentage" && (
                <p className="text-xs text-right text-muted-foreground">Total: {totalCustom}%</p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Catatan (opsional)</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan tambahan" />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Pengeluaran"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
