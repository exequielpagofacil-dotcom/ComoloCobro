"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return <AdminShell>{children}</AdminShell>;
}
