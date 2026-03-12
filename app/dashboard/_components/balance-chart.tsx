"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { Account, AccountsResponse } from "@/app/api/sparebank/types";
import type {
  ClassifiedTransaction,
  TransactionsByAccount,
} from "@/app/api/sparebank/types";

type BalancePoint = {
  date: string; // formatted date label
  balance: number;
};

const chartConfig = {
  balance: {
    label: "Balance",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

function deriveBalanceHistory(
  account: Account,
  transactions: ClassifiedTransaction[],
): BalancePoint[] {
  // Sort transactions descending by date (most recent first)
  const sorted = [...transactions].sort(
    (a, b) => b.transaction.date - a.transaction.date,
  );

  // Walk backwards from current balance to reconstruct history
  let runningBalance = account.balance;
  const points: { timestamp: number; balance: number }[] = [];

  for (const { transaction: tx } of sorted) {
    // The balance at this transaction's date (after it was applied) is runningBalance
    points.push({ timestamp: tx.date, balance: runningBalance });
    // Before this transaction, the balance was: runningBalance - tx.amount
    runningBalance -= tx.amount;
  }

  // Reverse to get ascending chronological order
  points.reverse();

  // Group by day — keep the last balance for each calendar date
  const byDay = new Map<string, number>();
  for (const point of points) {
    const label = new Date(point.timestamp).toLocaleDateString("nb-NO", {
      month: "short",
      day: "numeric",
    });
    byDay.set(label, point.balance);
  }

  return Array.from(byDay.entries()).map(([date, balance]) => ({
    date,
    balance,
  }));
}

function formatCurrency(value: number, currencyCode: string): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(value);
}

type BalanceChartProps = {
  selectedAccountKey: string | undefined;
};

export function BalanceChart({ selectedAccountKey }: BalanceChartProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactionsByAccount, setTransactionsByAccount] =
    useState<TransactionsByAccount>({});

  useEffect(() => {
    try {
      const rawAccounts = localStorage.getItem("sparebank_accounts");
      if (rawAccounts) {
        const parsed: AccountsResponse = JSON.parse(rawAccounts);
        if (parsed.accounts?.length) setAccounts(parsed.accounts);
      }
    } catch {
      // Ignore malformed data
    }

    try {
      const rawTx = localStorage.getItem("sparebank_transactions");
      if (rawTx) {
        const parsed: TransactionsByAccount = JSON.parse(rawTx);
        setTransactionsByAccount(parsed);
      }
    } catch {
      // Ignore malformed data
    }
  }, []);

  const account = useMemo(
    () => accounts.find((a) => a.key === selectedAccountKey),
    [accounts, selectedAccountKey],
  );

  const chartData = useMemo(() => {
    if (!account) return [];
    const transactions = transactionsByAccount[account.key] ?? [];
    return deriveBalanceHistory(account, transactions);
  }, [account, transactionsByAccount]);

  if (!selectedAccountKey) {
    return null;
  }

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{account.name}</CardTitle>
          <CardDescription>Balance history</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center">
          <p className="text-muted-foreground text-sm">
            No transaction data available. Fetch transactions to see balance
            history.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{account.name}</CardTitle>
        <CardDescription>
          Balance history &mdash;{" "}
          {formatCurrency(account.balance, account.currencyCode)} current
          balance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart data={chartData} margin={{ left: 0, right: 0 }}>
            <defs>
              <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-balance)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-balance)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12 }}
              tickFormatter={(v: number) =>
                new Intl.NumberFormat("nb-NO", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(v)
              }
              width={55}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    formatCurrency(Number(value), account.currencyCode)
                  }
                />
              }
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="var(--color-balance)"
              strokeWidth={2}
              fill="url(#balanceFill)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
