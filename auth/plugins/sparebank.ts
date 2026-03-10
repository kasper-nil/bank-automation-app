import "server-only";
import { createAuthEndpoint } from "better-auth/api";
import { sessionMiddleware } from "better-auth/api";
import type { BetterAuthPlugin } from "better-auth";
import { createSignedState, verifySignedState } from "@/auth/oauth-state";
import { encryptToken, decryptToken } from "@/auth/crypto";

const SPAREBANK_TOKEN_ENDPOINT = "https://api.sparebank1.no/oauth/token";

interface SparebankTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  state?: number;
}

/**
 * Server-side Sparebank plugin
 */
export const sparebankPlugin = () => {
  return {
    id: "sparebank-connect",

    schema: {
      sparebankConnection: {
        fields: {
          userId: {
            type: "string",
            required: true,
            unique: true,
            references: {
              model: "user",
              field: "id",
              onDelete: "cascade",
            },
          },
          accessToken: {
            type: "string",
            required: true,
          },
          refreshToken: {
            type: "string",
            required: true,
          },
          tokenType: {
            type: "string",
            required: true,
          },
          expiresAt: {
            type: "date",
            required: true,
          },
          scope: {
            type: "string",
            required: false,
          },
        },
      },
    },

    endpoints: {
      /**
       * GET /sparebank-connect/authorize
       * Returns the Sparebank OAuth authorize URL with a signed state token.
       */
      authorize: createAuthEndpoint(
        "/sparebank-connect/authorize",
        {
          method: "GET",
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const session = ctx.context.session;
          if (!session?.user.id) {
            return ctx.json({ error: "Unauthorized" }, { status: 401 });
          }

          const userId = session.user.id;
          const state = createSignedState(userId);

          const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_SPAREBANK_CLIENT_ID!,
            state,
            redirect_uri: process.env.NEXT_PUBLIC_SPAREBANK_REDIRECT_URL!,
            finInst: "fid-smn",
            response_type: "code",
          });

          const authorizeUrl = `https://api.sparebank1.no/oauth/authorize?${params.toString()}`;

          return ctx.json({ authorizeUrl });
        },
      ),

      /**
       * GET /sparebank-connect/callback
       * Handles the OAuth callback from Sparebank.
       * Exchanges code for tokens and stores them in the database.
       */
      callback: createAuthEndpoint(
        "/sparebank-connect/callback",
        {
          method: "GET",
        },
        async (ctx) => {
          // Extract code and state from query params
          const url = new URL(ctx.request?.url || "");
          const code = url.searchParams.get("code");
          const encodedState = url.searchParams.get("state");

          if (!code || !encodedState) {
            return ctx.json(
              { error: "Missing code or state" },
              { status: 400 },
            );
          }

          // Verify state
          let state;
          try {
            state = verifySignedState(encodedState);
          } catch (error) {
            return ctx.json(
              { error: "Invalid or expired state" },
              { status: 400 },
            );
          }

          const userId = state.userId;

          try {
            // Exchange code for tokens
            const tokenResponse = await fetch(SPAREBANK_TOKEN_ENDPOINT, {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                client_id: process.env.NEXT_PUBLIC_SPAREBANK_CLIENT_ID!,
                client_secret: process.env.SPAREBANK_CLIENT_SECRET!,
                redirect_uri: process.env.NEXT_PUBLIC_SPAREBANK_REDIRECT_URL!,
              }).toString(),
            });

            if (!tokenResponse.ok) {
              return ctx.json(
                { error: "Failed to exchange code for tokens" },
                { status: 400 },
              );
            }

            const tokens =
              (await tokenResponse.json()) as SparebankTokenResponse;

            if (!tokens.refresh_token) {
              return ctx.json(
                { error: "Missing refresh token from Sparebank" },
                { status: 400 },
              );
            }

            // Calculate expiry time
            const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

            // Encrypt tokens
            const encryptedAccessToken = encryptToken(tokens.access_token);
            const encryptedRefreshToken = encryptToken(tokens.refresh_token);

            // Store in database (upsert)
            const adapter = ctx.context.adapter;
            const existing = await (adapter as any).findOne({
              model: "sparebankConnection",
              where: [
                {
                  field: "userId",
                  value: userId,
                },
              ],
            });

            if (existing) {
              await (adapter as any).update({
                model: "sparebankConnection",
                where: [
                  {
                    field: "userId",
                    value: userId,
                  },
                ],
                data: {
                  accessToken: encryptedAccessToken,
                  refreshToken: encryptedRefreshToken,
                  tokenType: tokens.token_type,
                  expiresAt,
                  scope: tokens.state?.toString(),
                },
              });
            } else {
              await (adapter as any).create({
                model: "sparebankConnection",
                data: {
                  userId,
                  accessToken: encryptedAccessToken,
                  refreshToken: encryptedRefreshToken,
                  tokenType: tokens.token_type,
                  expiresAt,
                  scope: tokens.state?.toString(),
                },
              });
            }

            // Redirect to authentication page
            const baseURL = ctx.context.baseURL || "http://localhost:3000";
            const redirectUrl = new URL("/dashboard/authentication", baseURL);
            return ctx.redirect(redirectUrl.toString());
          } catch (error) {
            console.error("Sparebank callback error:", error);
            return ctx.json(
              { error: "Internal server error" },
              { status: 500 },
            );
          }
        },
      ),

      /**
       * GET /sparebank-connect/token
       * Returns a valid access token for the current user.
       * Auto-refreshes if expired.
       */
      token: createAuthEndpoint(
        "/sparebank-connect/token",
        {
          method: "GET",
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const session = ctx.context.session;
          if (!session?.user.id) {
            return ctx.json({ error: "Unauthorized" }, { status: 401 });
          }

          const userId = session.user.id;

          try {
            const adapter = ctx.context.adapter;
            const connection = await (adapter as any).findOne({
              model: "sparebankConnection",
              where: [
                {
                  field: "userId",
                  value: userId,
                },
              ],
            });

            if (!connection) {
              return ctx.json(
                { error: "No Sparebank connection found" },
                { status: 404 },
              );
            }

            // Check if token is expired (with a buffer to avoid edge cases)
            const expiresAt = new Date(connection.expiresAt);
            const refreshBufferMs = 5 * 60 * 1000;
            if (expiresAt.getTime() - refreshBufferMs > Date.now()) {
              // Token is still valid, decrypt and return
              const accessToken = decryptToken(connection.accessToken);
              return ctx.json({
                accessToken,
                tokenType: connection.tokenType,
                expiresAt,
              });
            }

            // Token expired, refresh it
            const refreshToken = decryptToken(connection.refreshToken);

            const tokenResponse = await fetch(SPAREBANK_TOKEN_ENDPOINT, {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: process.env.NEXT_PUBLIC_SPAREBANK_CLIENT_ID!,
                client_secret: process.env.SPAREBANK_CLIENT_SECRET!,
              }).toString(),
            });

            if (!tokenResponse.ok) {
              return ctx.json(
                { error: "Failed to refresh token" },
                { status: 400 },
              );
            }

            const tokens =
              (await tokenResponse.json()) as SparebankTokenResponse;

            // Calculate new expiry time
            const newExpiresAt = new Date(
              Date.now() + tokens.expires_in * 1000,
            );

            // Encrypt and update
            const encryptedAccessToken = encryptToken(tokens.access_token);
            const encryptedRefreshToken = tokens.refresh_token
              ? encryptToken(tokens.refresh_token)
              : connection.refreshToken;

            await (adapter as any).update({
              model: "sparebankConnection",
              where: [
                {
                  field: "userId",
                  value: userId,
                },
              ],
              data: {
                accessToken: encryptedAccessToken,
                refreshToken: encryptedRefreshToken,
                tokenType: tokens.token_type,
                expiresAt: newExpiresAt,
              },
            });

            return ctx.json({
              accessToken: tokens.access_token,
              tokenType: tokens.token_type,
              expiresAt: newExpiresAt,
            });
          } catch (error) {
            console.error("Sparebank token error:", error);
            return ctx.json(
              { error: "Internal server error" },
              { status: 500 },
            );
          }
        },
      ),

      /**
       * GET /sparebank-connect/status
       * Returns the connection status for the current user.
       */
      status: createAuthEndpoint(
        "/sparebank-connect/status",
        {
          method: "GET",
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const session = ctx.context.session;
          if (!session?.user.id) {
            return ctx.json({ error: "Unauthorized" }, { status: 401 });
          }

          const userId = session.user.id;

          try {
            const adapter = ctx.context.adapter;
            const connection = await (adapter as any).findOne({
              model: "sparebankConnection",
              where: [
                {
                  field: "userId",
                  value: userId,
                },
              ],
            });

            if (!connection) {
              return ctx.json({
                connected: false,
                expiresAt: null,
              });
            }

            return ctx.json({
              connected: true,
              expiresAt: connection.expiresAt,
              createdAt: connection.createdAt,
            });
          } catch (error) {
            console.error("Sparebank status error:", error);
            return ctx.json(
              { error: "Internal server error" },
              { status: 500 },
            );
          }
        },
      ),

      /**
       * POST /sparebank-connect/disconnect
       * Disconnects the Sparebank account for the current user.
       */
      disconnect: createAuthEndpoint(
        "/sparebank-connect/disconnect",
        {
          method: "POST",
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const session = ctx.context.session;
          if (!session?.user.id) {
            return ctx.json({ error: "Unauthorized" }, { status: 401 });
          }

          const userId = session.user.id;

          try {
            const adapter = ctx.context.adapter;
            await (adapter as any).delete({
              model: "sparebankConnection",
              where: [
                {
                  field: "userId",
                  value: userId,
                },
              ],
            });

            return ctx.json({ success: true });
          } catch (error) {
            console.error("Sparebank disconnect error:", error);
            return ctx.json(
              { error: "Internal server error" },
              { status: 500 },
            );
          }
        },
      ),
    },
  } satisfies BetterAuthPlugin;
};
