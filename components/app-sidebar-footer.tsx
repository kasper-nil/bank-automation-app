"use client";

import { Monitor, Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/auth/auth-client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { data: session } = authClient.useSession();

  useEffect(() => setMounted(true), []);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  const icon = mounted ? (
    <ThemeIcon theme={theme} />
  ) : (
    <Sun className="size-4" />
  );
  const activeLabel = mounted ? (theme ?? "system") : "system";

  return (
    <SidebarFooter>
      <SidebarMenu>
        {session?.user && (
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  tooltip="User menu"
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="size-4 rounded-full"
                    />
                  ) : (
                    <div className="size-4 rounded-full bg-muted" />
                  )}
                  <span className="truncate">{session.user.name}</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align={state === "collapsed" ? "center" : "start"}
                className="min-w-48"
              >
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-medium truncate">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="gap-2">
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        )}
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
