"use client";

import { AppPageHeader } from "@/components/app-page-header";
import { SparebankConnectionCard } from "./_components/sparebank-connection-card";

export default function AuthenticationPage() {
  return (
    <div className="space-y-6">
      <AppPageHeader />

      <div className="space-y-4 px-4 md:px-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Authentication</h1>
          <p className="text-muted-foreground">
            Manage your connected accounts and authentication settings
          </p>
        </div>

        <div className="grid gap-6 pt-4">
          <SparebankConnectionCard />
        </div>
      </div>
    </div>
  );
}
