"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import Logo from "@/components/ui/Logo";

const links = [["/phones", "Phones"], ["/about", "Our story"], ["/about#contact", "Contact"]];

export default function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-50 border-b border-black/[.06] bg-white/90 backdrop-blur-xl">
    <div className="container-shell flex h-[70px] items-center justify-between">
      <Logo />
      <nav className="hidden items-center gap-8 md:flex">
        {links.map(([href, label]) => <Link key={href} href={href} className={`text-[13px] font-semibold ${path === href ? "text-[#173f2c]" : "text-[#626b73] hover:text-black"}`}>{label}</Link>)}
      </nav>
      <div className="flex items-center gap-2">
        <Link href="/phones" aria-label="Search phones" className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#f3f4f2]"><Search size={18} /></Link>
        <Link href="/login" className="hidden rounded-full bg-[#173f2c] px-5 py-2.5 text-[12px] font-bold text-white hover:bg-[#245b42] sm:block">Store login</Link>
        <button aria-label="Toggle menu" onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-full bg-[#f2f3f1] md:hidden">{open ? <X size={18}/> : <Menu size={18}/>}</button>
      </div>
    </div>
    {open && <nav className="container-shell grid gap-1 border-t border-black/[.06] py-4 md:hidden">{links.map(([href, label]) => <Link onClick={() => setOpen(false)} key={href} href={href} className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-[#f3f4f2]">{label}</Link>)}<Link href="/login" className="mt-2 rounded-xl bg-[#173f2c] px-4 py-3 text-center text-sm font-bold text-white">Store login</Link></nav>}
  </header>;
}
