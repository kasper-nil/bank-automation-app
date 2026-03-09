export { getAuthorizeUrl } from "./authorize";
// Token helpers are environment-specific — import directly:
//   Server: import { getSparebankToken } from "@/lib/api/sparebank/token.server"
//   Client: import { fetchSparebankToken } from "@/lib/api/sparebank/token.client"
//   Middleware: import { getSparebankToken } from "@/lib/api/sparebank/middleware"
export type { SparebankToken } from "./token.server";
