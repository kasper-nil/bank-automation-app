"use client";

import { useState } from "react";
import { authClient } from "@/auth/auth-client";
import {
  getClassifiedTransactions,
  groupTransactionsByAccount,
} from "@/lib/api/sparebank/transactions";
import type { AccountsResponse } from "@/lib/api/sparebank/accounts";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

async function fetchSparebankTokenFromAuthClient(): Promise<string | null> {
  try {
    const response = await authClient.sparebankConnect.token();
    const data = response.data;
    if (!data || !("accessToken" in data)) {
      return null;
    }
    return data.accessToken;
  } catch (error) {
    console.error("Failed to fetch Sparebank token:", error);
    return null;
  }
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
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

      const accessToken = await fetchSparebankTokenFromAuthClient();
      if (!accessToken) {
        toast.error("No access token available. Please log in first.");
        return;
      }

      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(toDate.getDate() - 30);

      const response = await getClassifiedTransactions(accessToken, "Bearer", {
        accountKeys,
        fromDate: formatDate(fromDate),
        toDate: formatDate(toDate),
        transactionSource: "ALL",
      });

      const grouped = groupTransactionsByAccount(response.transactions ?? []);
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
