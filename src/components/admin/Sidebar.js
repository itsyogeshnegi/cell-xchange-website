"use client";

import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Boxes, LayoutDashboard, LogOut, PanelsTopLeft, ReceiptText, Settings, Tags, X } from "lucide-react";
import Logo from "@/components/ui/Logo";

const links = [
  ["/dashboard", LayoutDashboard, "Overview"],
  ["/dashboard/phones", Boxes, "Inventory"],
  ["/dashboard/brands", Tags, "Brands"],
  ["/dashboard/invoices", ReceiptText, "Invoices"],
  ["/dashboard/content", PanelsTopLeft, "Website content"],
  ["/dashboard/settings", Settings, "Settings"],
];
const adminOnlyPaths = new Set(["/dashboard/content", "/dashboard/settings"]);

export default function Sidebar({ profile, role, mobileOpen = false, onClose = () => {} }) {
  const path = usePathname();
  const router = useRouter();
  const visibleLinks = links.filter(([href]) => role !== "manager" || !adminOnlyPaths.has(href));
  const logout = async () => {
    await axios.post("/api/auth/logout");
    onClose();
    router.push("/login");
    router.refresh();
  };

  return <>
    <button type="button" aria-label="Close dashboard navigation" onClick={onClose} className={`fixed inset-0 z-40 bg-black/45 transition-opacity lg:hidden ${mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}/>
    <aside id="dashboard-navigation" aria-label="Dashboard navigation" className={`fixed inset-y-0 left-0 z-50 flex w-[min(82vw,280px)] flex-col border-r border-[#e6e8e6] bg-white p-5 shadow-2xl transition-transform duration-300 lg:z-30 lg:w-64 lg:translate-x-0 lg:shadow-none ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center justify-between gap-4 px-2 py-3"><Logo logo={profile?.brandLogo} name={profile?.name}/><button type="button" onClick={onClose} aria-label="Close menu" className="grid size-10 place-items-center rounded-full bg-[#f2f4f2] lg:hidden"><X size={18}/></button></div>
      <nav className="mt-7 grid gap-1">
        {visibleLinks.map(([href, Icon, label]) => {
          const active = href === "/dashboard" ? path === href : path.startsWith(href);
          return <Link key={href} href={href} onClick={onClose} className={`flex items-center gap-3 rounded-xl px-3 py-3.5 text-[13px] font-bold ${active ? "bg-[#173f2c] text-white" : "text-[#69716c] hover:bg-[#f3f5f2] hover:text-black"}`}><Icon size={17}/>{label}</Link>;
        })}
      </nav>
      <div className="mt-auto rounded-2xl bg-[#f2f5f1] p-4"><BarChart3 size={20} className="text-[#5e806c]"/><p className="mt-3 text-xs font-bold">{role === "manager" ? "Manager access" : role === "super_admin" ? "Super admin access" : "Admin access"}</p><p className="mt-1 text-[11px] leading-5 text-[#7a827c]">{role === "manager" ? "Operational dashboard access." : role === "super_admin" ? "Full workspace and account access." : "Full inventory and website access."}</p></div>
      <button onClick={logout} className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3.5 text-[13px] font-bold text-[#69716c] hover:bg-[#fff0f0] hover:text-red-700"><LogOut size={17}/>Sign out</button>
    </aside>
  </>;
}
