"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Account, AccountsResponse } from "@/lib/api/sparebank/accounts";

function formatBalance(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

function formatAccountNumber(raw: string): string {
  // Format as XXXX XX XXXXX
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`;
  }
  return raw;
}

type AccountSelectProps = {
  value?: string;
  onValueChange?: (value: string) => void;
};

export function AccountSelect({ value, onValueChange }: AccountSelectProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sparebank_accounts");
      if (!raw) return;
      const parsed: AccountsResponse = JSON.parse(raw);
      if (parsed.accounts?.length) {
        setAccounts(parsed.accounts);
      }
    } catch {
      // Ignore malformed data
    }
  }, []);

  const hasAccounts = accounts.length > 0;

  return (
    <Select disabled={!hasAccounts} value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={
            hasAccounts ? "Select an account" : "No accounts fetched yet"
          }
        />
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account) => (
          <SelectItem key={account.key} value={account.key}>
            <div className="flex flex-col gap-0.5 py-0.5">
              <span className="font-medium">{account.name}</span>
              <span className="text-muted-foreground text-xs">
                {formatAccountNumber(account.accountNumber)}
              </span>
              <span className="text-xs tabular-nums">
                {formatBalance(account.balance, account.currencyCode)}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
