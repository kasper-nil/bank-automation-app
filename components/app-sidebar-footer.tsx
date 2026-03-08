"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

function ThemeIcon({ theme }: { theme: string | undefined }) {
  if (theme === "dark") return <Moon className="size-4" />;
  if (theme === "system") return <Monitor className="size-4" />;
  return <Sun className="size-4" />;
}

export function AppSidebarFooter() {
  const { theme, setTheme } = useTheme();
  const { state } = useSidebar();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const icon = mounted ? (
    <ThemeIcon theme={theme} />
  ) : (
    <Sun className="size-4" />
  );
  const activeLabel = mounted ? (theme ?? "system") : "system";

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                tooltip="Theme"
                className="data-[state=open]:bg-sidebar-accent"
              >
                {icon}
                <span>Theme</span>
                {state === "expanded" && (
                  <span className="ml-auto text-xs text-muted-foreground capitalize">
                    {activeLabel}
                  </span>
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align={state === "collapsed" ? "center" : "start"}
              className="min-w-36"
            >
              {themes.map(({ value, label, icon: Icon }) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => setTheme(value)}
                  className="gap-2"
                >
                  <Icon className="size-4" />
                  {label}
                  {mounted && theme === value && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      Active
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
