import { createAuthClient } from "better-auth/react";
import { sparebankPluginClient } from "@/auth/plugins/sparebank-client";

const sparebankConnectPlugin = sparebankPluginClient();

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  plugins: [sparebankConnectPlugin] as const,
});
