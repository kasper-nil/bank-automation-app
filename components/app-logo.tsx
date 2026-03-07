import { Landmark } from "lucide-react";

export function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <Landmark className="size-5 shrink-0" />
      <span className="text-sm font-semibold">Bank App</span>
    </div>
  );
}
