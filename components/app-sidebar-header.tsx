"use client";

import { Landmark } from "lucide-react";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppLogo } from "@/components/app-logo";

export function AppSidebarHeader() {
  const { state } = useSidebar();

  // Collapsed (icon-only) desktop: Landmark icon above trigger, centered. No text.
  if (state === "collapsed") {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="flex size-7 items-center justify-center">
          <Landmark className="size-4" />
        </div>
        <SidebarTrigger />
      </div>
    );
  }

  // Expanded: logo (icon + text) on the left, trigger on the right.
  // px-2 on the logo matches the inner padding of nav items (SidebarGroup p-2 + SidebarMenuButton p-2).
  return (
    <div className="flex items-center justify-between">
      <div className="px-2">
        <AppLogo />
      </div>
      <SidebarTrigger />
    </div>
  );
}
