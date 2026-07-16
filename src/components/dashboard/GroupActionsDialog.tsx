"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function GroupActionsDialog({ onCreated }: { onCreated: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Gagal membuat grup.");
      setOpen(false);
      setName("");
      setDescription("");
      onCreated();
      router.push(`/groups/${data.group.id}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_code: inviteCode }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Gagal bergabung ke grup.");
      setOpen(false);
      setInviteCode("");
      onCreated();
      router.push(`/groups/${data.group.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); setError(""); }}>
      <DialogTrigger className="inline-flex items-center gap-1.5 rounded-md bg-[var(--rose-400)] text-white text-sm font-medium px-3 py-1.5 hover:bg-[var(--rose-300)] active:scale-[0.97] transition-all">
        <Icon icon="solar:add-circle-bold" className="text-base" />
        Grup Baru
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-[var(--maroon-dark)]">Grup</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="create">
          <TabsList className="w-full">
            <TabsTrigger value="create" className="flex-1">Buat Grup</TabsTrigger>
            <TabsTrigger value="join" className="flex-1">Gabung Grup</TabsTrigger>
          </TabsList>

          {error && (
            <div className="mt-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
              {error}
            </div>
          )}

          <TabsContent value="create" className="mt-2">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="gname">Nama Grup</Label>
                <Input id="gname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Kos Ceria" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gdesc">Deskripsi (opsional)</Label>
                <Input id="gdesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Patungan bulanan" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Memproses..." : "Buat Grup"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="join" className="mt-2">
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="gcode">Kode Undangan</Label>
                <Input
                  id="gcode"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="6A9E61"
                  className="uppercase tracking-widest font-mono"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Memproses..." : "Gabung Grup"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
