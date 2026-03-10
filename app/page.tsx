"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/auth/auth-client";

export default function Home() {
  const router = useRouter();

  async function handleSignIn() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  }

  return (
    <div>
      <Button onClick={handleSignIn}>Sign in with Google</Button>
    </div>
  );
}
