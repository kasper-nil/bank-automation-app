"use client";

import { useState } from "react";
import type {
  AccountsResponse,
  ClassifiedTransaction,
  TransactionsByAccount,
} from "@/app/api/sparebank/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function groupTransactionsByAccount(
  transactions: ClassifiedTransaction[],
): TransactionsByAccount {
  return transactions.reduce<TransactionsByAccount>((acc, item) => {
    const key = item.transaction.accountKey;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

export function FetchTransactionsButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    try {
      const raw = localStorage.getItem("sparebank_accounts");
      if (!raw) {
        toast.error("No accounts found. Please fetch accounts first.");
        return;
      }

      const { accounts }: AccountsResponse = JSON.parse(raw);
      const accountKeys = accounts.map((a) => a.key);

      if (accountKeys.length === 0) {
        toast.error("No account keys available.");
        return;
      }

      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(toDate.getDate() - 30);

      const query = new URLSearchParams();
      for (const key of accountKeys) {
        query.append("accountKey", key);
      }
      query.set("fromDate", formatDate(fromDate));
      query.set("toDate", formatDate(toDate));
      query.set("transactionSource", "ALL");

      const response = await fetch(
        `/api/sparebank/transactions?${query.toString()}`,
      );

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to fetch transactions.");
      }

      const data = (await response.json()) as {
        transactions: ClassifiedTransaction[];
      };

      const grouped = groupTransactionsByAccount(data.transactions ?? []);
      localStorage.setItem("sparebank_transactions", JSON.stringify(grouped));
      toast.success("Saved to localStorage");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to fetch transactions.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? "Fetching..." : "Fetch Transactions"}
    </Button>
  );
}
