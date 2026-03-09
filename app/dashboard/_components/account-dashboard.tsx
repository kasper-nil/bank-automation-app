"use client";

import { useState } from "react";
import { AccountSelect } from "./account-select";
import { BalanceChart } from "./balance-chart";

export function AccountDashboard() {
  const [selectedAccountKey, setSelectedAccountKey] = useState<
    string | undefined
  >(undefined);

  return (
    <div className="space-y-4">
      <AccountSelect
        value={selectedAccountKey}
        onValueChange={setSelectedAccountKey}
      />
      <BalanceChart selectedAccountKey={selectedAccountKey} />
    </div>
  );
}
