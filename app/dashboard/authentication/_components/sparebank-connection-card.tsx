"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authClient } from "@/auth/auth-client";

interface ConnectionStatus {
  connected: boolean;
  expiresAt?: Date | string;
  createdAt?: Date | string;
}

export function SparebankConnectionCard() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch connection status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    try {
      setLoading(true);
      const response = await (authClient.sparebankConnect as any).status();
      if (response.data) {
        setStatus(response.data);
      }
      setError(null);
    } catch (err) {
      setError("Failed to check connection status");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect() {
    try {
      setIsConnecting(true);
      setError(null);
      const response = await (authClient.sparebankConnect as any).authorize();
      if (response.data?.authorizeUrl) {
        // Redirect to Sparebank OAuth
        window.location.href = response.data.authorizeUrl;
      } else {
        throw new Error("Failed to get authorize URL");
      }
    } catch (err) {
      setError("Failed to start connection process");
      console.error(err);
      setIsConnecting(false);
    }
  }

  async function handleDisconnect() {
    try {
      setLoading(true);
      const response = await (authClient.sparebankConnect as any).disconnect();
      if (response.data?.success) {
        setStatus({ connected: false });
        setError(null);
      }
    } catch (err) {
      setError("Failed to disconnect");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading && status === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sparebank Connection</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isConnected = status?.connected ?? false;
  const expiresAt = status?.expiresAt ? new Date(status.expiresAt) : null;
  const createdAt = status?.createdAt ? new Date(status.createdAt) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sparebank Connection</CardTitle>
        <CardDescription>
          {isConnected ? (
            <span className="text-green-600">
              ✓ Connected to Sparebank1 SMN
            </span>
          ) : (
            "Not connected to Sparebank1"
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {isConnected && expiresAt && (
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Token expires:</span>{" "}
              <span className="font-medium">
                {expiresAt.toLocaleDateString()}{" "}
                {expiresAt.toLocaleTimeString()}
              </span>
            </div>
            {createdAt && (
              <div>
                <span className="text-muted-foreground">Connected:</span>{" "}
                <span className="font-medium">
                  {createdAt.toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {!isConnected ? (
            <Button onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect Sparebank"}
            </Button>
          ) : (
            <>
              <Button onClick={handleDisconnect} disabled={loading}>
                {loading ? "Disconnecting..." : "Disconnect"}
              </Button>
              <Button
                variant="outline"
                onClick={checkStatus}
                disabled={loading}
              >
                Refresh Status
              </Button>
            </>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          {isConnected ? (
            <p>
              Your Sparebank account is connected. Your bank data will be
              fetched and displayed on the dashboard. You can disconnect at any
              time.
            </p>
          ) : (
            <p>
              Connect your Sparebank account to access your account information
              and transactions. This uses BankID for authentication.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
