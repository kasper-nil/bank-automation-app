"use client";

import { Button } from "@/components/ui/button";
import { getAuthorizeUrl } from "@/lib/api/sparebank";

export default function Home() {
  function handleAuthenticate() {
    window.location.href = getAuthorizeUrl();
  }

  return (
    <div>
      <Button onClick={handleAuthenticate}>Authenticate</Button>
    </div>
  );
}
