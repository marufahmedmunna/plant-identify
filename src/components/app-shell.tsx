import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-sm w-full h-full bg-[#f0fff4] overflow-hidden   relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2   z-10" />
      <div className="h-full w-full overflow-y-auto">{children}</div>
    </div>
  );
}
