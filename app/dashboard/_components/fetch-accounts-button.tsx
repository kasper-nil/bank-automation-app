"use client";

import { useState } from "react";
import { fetchSparebankToken } from "@/lib/api/sparebank/token.client";
import { getAccounts } from "@/lib/api/sparebank/accounts";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function FetchAccountsButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    try {
      const accessToken = await fetchSparebankToken();
      if (!accessToken) {
        toast.error("No access token available. Please log in first.");
        return;
      }

      const accounts = await getAccounts(accessToken, "Bearer");
      localStorage.setItem("sparebank_accounts", JSON.stringify(accounts));
      toast.success("Saved to localStorage");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to fetch accounts.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? "Fetching..." : "Fetch Accounts"}
    </Button>
  );
}
