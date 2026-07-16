/**
 * Debt Simplification Algorithm
 * Given net balances { userId: netAmount } (positive = should receive, negative = owes),
 * produce the minimum set of transactions {from, to, amount} that settles all debts.
 * Greedy approach: repeatedly match the biggest debtor with the biggest creditor.
 */
export type Balances = Record<string, number>;
export type Transaction = { from: string; to: string; amount: number };

export function simplifyDebts(balances: Balances): Transaction[] {
  const creditors: { userId: string; amount: number }[] = [];
  const debtors: { userId: string; amount: number }[] = [];
  const EPS = 0.01;

  for (const [userId, amount] of Object.entries(balances)) {
    if (amount > EPS) creditors.push({ userId, amount });
    else if (amount < -EPS) debtors.push({ userId, amount: -amount });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions: Transaction[] = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const settled = Math.min(debtor.amount, creditor.amount);

    if (settled > EPS) {
      transactions.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(settled * 100) / 100,
      });
    }

    debtor.amount -= settled;
    creditor.amount -= settled;

    if (debtor.amount <= EPS) i++;
    if (creditor.amount <= EPS) j++;
  }

  return transactions;
}
