"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppLogo } from "@/components/app-logo";

export function AppPageHeader() {
  const { isMobile, openMobile } = useSidebar();

  // Desktop: trigger always lives inside the sidebar — nothing to render here.
  if (!isMobile) return null;

  // Mobile, Sheet open: Sheet's own header handles the logo + trigger.
  if (openMobile) return null;

  // Mobile, Sheet closed: full-width nav bar with trigger + logo, then a separator.
  return (
    <>
      <header className="flex h-14 items-center gap-3 px-4">
        <SidebarTrigger />
        <AppLogo />
      </header>
      <Separator />
    </>
  );
}
