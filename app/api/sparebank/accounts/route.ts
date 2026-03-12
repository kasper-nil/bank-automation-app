import { NextResponse } from "next/server";
import { auth } from "@/auth/auth";
import { getSparebankToken } from "@/auth/plugins/sparebank";
import type { AccountsResponse } from "@/app/api/sparebank/types";

const SPAREBANK_ACCOUNTS_URL =
  "https://api.sparebank1.no/personal/banking/accounts";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { accessToken, tokenType } = await getSparebankToken(session.user.id);

    const response = await fetch(SPAREBANK_ACCOUNTS_URL, {
      headers: {
        Accept: "application/vnd.sparebank1.v1+json; charset=utf-8",
        Authorization: `${tokenType} ${accessToken}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Sparebank API error: ${response.status} ${response.statusText}`,
        },
        { status: response.status },
      );
    }

    const data = (await response.json()) as AccountsResponse;
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    const status = message === "No Sparebank connection found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
