"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function FetchAccountsButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    try {
      const response = await fetch("/api/sparebank/accounts", {
        method: "GET",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to fetch accounts.");
      }

      const accounts = await response.json();
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
