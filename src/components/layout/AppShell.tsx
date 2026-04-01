"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = pathname !== "/" && !pathname.startsWith("/auth");

  if (!showSidebar) return <>{children}</>;

  return (
    <>
      <Sidebar />
      <div
        className="min-h-screen transition-[margin-left] duration-300 ease-out"
        style={{ marginLeft: "var(--sidebar-width, 0px)" }}
      >
        {children}
      </div>
    </>
  );
}
