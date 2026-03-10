"use client";

import { useState } from "react";
import { authClient } from "@/auth/auth-client";
import { getAccounts } from "@/lib/api/sparebank/accounts";
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

export function FetchAccountsButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    try {
      const accessToken = await fetchSparebankTokenFromAuthClient();
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
