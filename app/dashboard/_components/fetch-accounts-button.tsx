"use client";

import { useState } from "react";
import { fetchSparebankToken } from "@/lib/api/sparebank/token.client";
import { getAccounts } from "@/lib/api/sparebank/accounts";
import { Button } from "@/components/ui/button";

export function FetchAccountsButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleClick() {
    setLoading(true);
    setError(null);
    setDone(false);

    try {
      const accessToken = await fetchSparebankToken();
      if (!accessToken) {
        setError("No access token available. Please log in first.");
        return;
      }

      const accounts = await getAccounts(accessToken, "Bearer");
      localStorage.setItem("sparebank_accounts", JSON.stringify(accounts));
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch accounts.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={handleClick} disabled={loading}>
        {loading ? "Fetching..." : "Fetch Accounts"}
      </Button>
      {done && (
        <span className="text-muted-foreground text-sm">
          Saved to localStorage
        </span>
      )}
      {error && <span className="text-destructive text-sm">{error}</span>}
    </div>
  );
}
