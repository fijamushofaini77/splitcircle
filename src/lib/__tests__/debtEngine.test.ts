import { describe, expect, it } from "vitest";
import { simplifyDebts, type Balances, type Transaction } from "@/lib/debtEngine";

/**
 * Terapkan hasil transaksi ke balances asli, lalu pastikan semua net-nya
 * mendekati nol. Ini invariant paling penting: apapun urutan greedy-nya,
 * hasil akhirnya harus benar-benar melunasi semua utang.
 */
function applyTransactions(balances: Balances, transactions: Transaction[]): Balances {
  const result = { ...balances };
  for (const tx of transactions) {
    result[tx.from] = (result[tx.from] ?? 0) + tx.amount;
    result[tx.to] = (result[tx.to] ?? 0) - tx.amount;
  }
  return result;
}

function expectFullySettled(balances: Balances, transactions: Transaction[]) {
  const after = applyTransactions(balances, transactions);
  for (const amount of Object.values(after)) {
    expect(Math.abs(amount)).toBeLessThan(0.01);
  }
}

describe("simplifyDebts", () => {
  it("mengembalikan array kosong kalau tidak ada balances", () => {
    expect(simplifyDebts({})).toEqual([]);
  });

  it("mengembalikan array kosong kalau semua sudah lunas (termasuk dust di bawah epsilon)", () => {
    const balances: Balances = { alice: 0, bob: 0.005, carol: -0.004 };
    expect(simplifyDebts(balances)).toEqual([]);
  });

  it("kasus sederhana: satu debitur, satu kreditur", () => {
    const balances: Balances = { alice: 100, bob: -100 };
    const result = simplifyDebts(balances);
    expect(result).toEqual([{ from: "bob", to: "alice", amount: 100 }]);
    expectFullySettled(balances, result);
  });

  it("banyak debitur, satu kreditur", () => {
    const balances: Balances = { alice: 150, bob: -100, carol: -50 };
    const result = simplifyDebts(balances);
    expect(result.length).toBeLessThanOrEqual(Object.keys(balances).length - 1);
    expectFullySettled(balances, result);
  });

  it("satu debitur, banyak kreditur", () => {
    const balances: Balances = { alice: 60, bob: 40, dave: -100 };
    const result = simplifyDebts(balances);
    expect(result.length).toBeLessThanOrEqual(Object.keys(balances).length - 1);
    expectFullySettled(balances, result);
  });

  it("kasus kompleks banyak anggota, jumlah transaksi minimal (n-1)", () => {
    const balances: Balances = {
      alice: 120,
      bob: -30,
      carol: 45,
      dave: -75,
      erin: -60,
    };
    const result = simplifyDebts(balances);
    expect(result.length).toBeLessThanOrEqual(Object.keys(balances).length - 1);
    expectFullySettled(balances, result);
  });

  it("hasil amount selalu dibulatkan 2 desimal dan tidak pernah 0 atau negatif", () => {
    const balances: Balances = { alice: 33.333, bob: 33.334, carol: -66.667 };
    const result = simplifyDebts(balances);
    for (const tx of result) {
      expect(tx.amount).toBeGreaterThan(0);
      expect(tx.amount).toBe(Math.round(tx.amount * 100) / 100);
    }
    expectFullySettled(balances, result);
  });

  it("tidak memutasi object balances asli", () => {
    const balances: Balances = { alice: 100, bob: -100 };
    const snapshot = { ...balances };
    simplifyDebts(balances);
    expect(balances).toEqual(snapshot);
  });
});
