import { createAuthClient } from "better-auth/react";
import { sparebankPluginClient } from "@/auth/plugins/sparebank-client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  plugins: [sparebankPluginClient()],
});
