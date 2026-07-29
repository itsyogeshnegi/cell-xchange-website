"use client";

import { Bell, Menu, Search } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function AdminHeader({ profile, mobileMenuOpen = false, onOpenMenu }) {
  return <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e3e4e2] bg-white/95 px-3 backdrop-blur sm:h-[72px] sm:px-6 xl:px-8">
    <div className="min-w-0 lg:hidden"><Logo compact logo={profile?.brandLogo} name={profile?.name}/></div>
    <label className="hidden items-center gap-2 rounded-full bg-[#f3f3f1] px-4 sm:flex"><Search size={15}/><input placeholder="Search inventory" className="h-10 w-40 bg-transparent text-xs outline-none xl:w-52"/></label>
    <div className="ml-auto flex items-center gap-2 sm:gap-3"><button type="button" aria-label="Notifications" className="grid size-10 place-items-center rounded-full border border-[#e2e3e1]"><Bell size={16}/></button><div className="grid size-10 place-items-center rounded-full bg-[#dfe6ff] text-[10px] font-black">CX</div><button type="button" onClick={onOpenMenu} aria-label="Open dashboard menu" aria-controls="dashboard-navigation" aria-expanded={mobileMenuOpen} className="grid size-10 place-items-center rounded-full border border-[#e2e3e1] lg:hidden"><Menu size={18}/></button></div>
  </header>;
}
