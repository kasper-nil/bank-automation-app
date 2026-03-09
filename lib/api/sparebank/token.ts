const TOKEN_KEY = "sparebank_token";

export interface SparebankToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  state: number;
  issued_at: number;
}

function getStoredToken(): SparebankToken | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SparebankToken;
  } catch {
    return null;
  }
}

function isExpired(token: SparebankToken): boolean {
  return Date.now() > token.issued_at + token.expires_in * 1000;
}

async function refreshToken(): Promise<string | null> {
  const token = getStoredToken();
  if (!token?.refresh_token) return null;

  const response = await fetch("/api/auth/sparebank/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: token.refresh_token }),
  });

  if (!response.ok) return null;

  const newTokenData = await response.json();
  const newToken: SparebankToken = { ...newTokenData, issued_at: Date.now() };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(newToken));

  return newToken.access_token;
}

export async function getToken(): Promise<string | null> {
  const token = getStoredToken();
  if (!token) return null;
  if (!isExpired(token)) return token.access_token;
  return refreshToken();
}
