"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Logo } from "@/components/brand/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan. Silakan coba lagi.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-[380px] border-none shadow-lg">
      <CardHeader>
        <Logo className="mb-2" />
        <h1 className="text-xl font-semibold text-[var(--maroon-dark)]">Buat akun baru</h1>
        <p className="text-sm text-muted-foreground">
          Mulai kelola patungan dengan circle-mu.
        </p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 flex items-center gap-2">
            <Icon icon="solar:danger-triangle-bold" className="shrink-0" />
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              placeholder="Nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses..." : "Daftar"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-[var(--rose-400)] font-medium hover:underline">
            Masuk di sini
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
