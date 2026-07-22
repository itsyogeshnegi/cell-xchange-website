"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import Logo from "@/components/ui/Logo";
import { store } from "@/lib/store";

const links = [["/phones", "Shop phones"], ["/about", "Our store"], ["/about#contact", "Visit us"]];

export default function Header({ profile = store }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-50 border-b border-black/[.08] bg-white/95 backdrop-blur-xl">
    <div className="bg-[#0b0c0e] text-white"><div className="container-shell flex h-8 items-center justify-between text-[10px] font-semibold tracking-[.04em] text-white/65"><span><i className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#4ade80]"/>Open today · {profile.hours}</span><a href={`tel:${profile.phoneE164}`} className="text-white/80 hover:text-white">{profile.phoneDisplay}</a></div></div>
    <div className="container-shell flex h-[68px] items-center justify-between">
      <Logo name={profile.name}/>
      <nav className="hidden items-center gap-9 md:flex">{links.map(([href, label]) => <Link key={href} href={href} className={`text-[12px] font-semibold tracking-[.01em] ${path === href || (href === "/phones" && path.startsWith("/phones/")) ? "text-black" : "text-[#73767c] hover:text-black"}`}>{label}</Link>)}</nav>
      <div className="flex items-center gap-1.5"><Link href="/phones" aria-label="Search phones" className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#f2f2f0]"><Search size={17}/></Link><Link href="/login" className="hidden border border-black px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.12em] hover:bg-black hover:text-white sm:block">Staff login</Link><button aria-label="Toggle menu" onClick={() => setOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-full bg-[#f2f2f0] md:hidden">{open ? <X size={18}/> : <Menu size={18}/>}</button></div>
    </div>
    {open && <nav className="container-shell grid gap-1 border-t border-black/[.06] py-4 md:hidden">{links.map(([href, label]) => <Link onClick={() => setOpen(false)} key={href} href={href} className="border-b border-black/[.06] px-1 py-3 text-sm font-semibold">{label}</Link>)}<Link href="/login" className="mt-3 bg-black px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white">Staff login</Link></nav>}
  </header>;
}
