"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import Sidebar from "@/components/admin/Sidebar";

export default function DashboardShell({ profile, role, children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return <div className="min-h-screen overflow-x-hidden bg-[#f5f6f4]">
    <Sidebar profile={profile} role={role} mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}/>
    <div className="min-w-0 lg:pl-64">
      <AdminHeader profile={profile} mobileMenuOpen={mobileMenuOpen} onOpenMenu={() => setMobileMenuOpen(true)}/>
      <main className="min-w-0 p-3 sm:p-6 xl:p-8">{children}</main>
    </div>
  </div>;
}
