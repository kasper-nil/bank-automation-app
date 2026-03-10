import type { BetterAuthClientPlugin } from "better-auth/client";
import type { sparebankPlugin } from "./sparebank";

/**
 * Client-side Sparebank plugin
 * Infers types from the server plugin
 */
export const sparebankPluginClient = () => {
  return {
    id: "sparebank-connect",
    $InferServerPlugin: {} as ReturnType<typeof sparebankPlugin>,
    pathMethods: {
      "/sparebank-connect/disconnect": "POST",
    },
  } satisfies BetterAuthClientPlugin;
};
