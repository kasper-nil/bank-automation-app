"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/api/sparebank";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    getToken().then((token: string | null) => {
      if (!token) router.replace("/");
    });
  }, [router]);

  return <>{children}</>;
}
