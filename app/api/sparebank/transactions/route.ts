import { NextResponse } from "next/server";
import { auth } from "@/auth/auth";
import { getSparebankToken } from "@/auth/plugins/sparebank";
import type { ClassifiedTransactionsResponse } from "@/app/api/sparebank/types";

const SPAREBANK_TRANSACTIONS_URL =
  "https://api.sparebank1.no/personal/banking/transactions/classified";

function getAccountKeys(searchParams: URLSearchParams): string[] {
  return searchParams.getAll("accountKey").filter(Boolean);
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const accountKeys = getAccountKeys(url.searchParams);
  const fromDate = url.searchParams.get("fromDate") || "";
  const toDate = url.searchParams.get("toDate") || "";
  const transactionSource =
    (url.searchParams.get("transactionSource") as "ALL") || "ALL";

  if (!accountKeys.length || !fromDate || !toDate) {
    return NextResponse.json(
      {
        error: "Missing required query params: accountKey, fromDate, toDate",
      },
      { status: 400 },
    );
  }

  try {
    const { accessToken, tokenType } = await getSparebankToken(session.user.id);

    const query = new URLSearchParams();
    for (const key of accountKeys) {
      query.append("accountKey", key);
    }
    query.set("fromDate", fromDate);
    query.set("toDate", toDate);
    query.set("transactionSource", transactionSource);

    const response = await fetch(`${SPAREBANK_TRANSACTIONS_URL}?${query}`, {
      method: "GET",
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

    const data = (await response.json()) as ClassifiedTransactionsResponse;
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    const status = message === "No Sparebank connection found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
