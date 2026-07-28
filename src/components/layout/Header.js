"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import Logo from "@/components/ui/Logo";
import { store } from "@/lib/store";

const links = [["/phones", "Shop devices"], ["/about", "Our store"], ["/about#contact", "Visit us"]];

function OfferTicker({ text }) {
  return <div className="offer-ticker border-t border-white/10 bg-[#000000] text-white" role="region" aria-label="Current offers">
    <span className="sr-only">{text}</span>
    <div className="offer-ticker-track h-8 items-center text-[9px] font-bold uppercase tracking-[.14em]" aria-hidden="true">
      {[0, 1].map((copy) => <div key={copy} className="offer-ticker-group">
        {[0, 1, 2].map((item) => <span key={item} className="flex shrink-0 items-center gap-12 whitespace-nowrap px-6">
          {text}<i className="not-italic text-[#f5d66f]">◆</i>
        </span>)}
      </div>)}
    </div>
  </div>;
}

export default function Header({ profile = store }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-50 border-b border-white/10 bg-[#000000] text-white">
    <div className="bg-[#000000] text-white"><div className="container-shell flex h-8 items-center justify-between text-[10px] font-semibold tracking-[.04em] text-white/65"><span><i className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#4ade80]"/>Open today · {profile.hours}</span><a href={`tel:${profile.phoneE164}`} className="text-white/80 hover:text-white">{profile.phoneDisplay}</a></div></div>
    <div className="container-shell flex h-[68px] items-center justify-between border-t border-white/10">
      <Logo light={!profile.brandLogo?.url} logo={profile.brandLogo} name={profile.name}/>
      <nav className="hidden items-center gap-9 md:flex">{links.map(([href, label]) => <Link key={href} href={href} className={`text-[12px] font-semibold tracking-[.01em] ${path === href || (href === "/phones" && path.startsWith("/phones/")) ? "text-white" : "text-white/55 hover:text-white"}`}>{label}</Link>)}</nav>
      <div className="flex items-center gap-1.5"><Link href="/phones" aria-label="Search phones" className="grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/10"><Search size={17}/></Link><button aria-label="Toggle menu" onClick={() => setOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white md:hidden">{open ? <X size={18}/> : <Menu size={18}/>}</button></div>
    </div>
    {open && <nav className="container-shell grid gap-1 border-t border-white/10 py-4 md:hidden">{links.map(([href, label]) => <Link onClick={() => setOpen(false)} key={href} href={href} className="border-b border-white/10 px-1 py-3 text-sm font-semibold text-white/75 hover:text-white">{label}</Link>)}</nav>}
    {profile.offerBarEnabled && profile.offerBarText && <OfferTicker text={profile.offerBarText}/>}
  </header>;
}
