import Link from "next/link";
import { ArrowUpRight, Instagram, MapPin } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function Footer() {
  return <footer className="bg-[#102c20] text-white">
    <div className="container-shell py-16">
      <div className="grid gap-12 border-b border-white/15 pb-14 md:grid-cols-[1.4fr_.6fr_.6fr]">
        <div><Logo light /><p className="mt-5 max-w-sm text-sm leading-6 text-white/60">Carefully sourced smartphones, honest advice, and real after-sales care. Your next phone should feel exactly right.</p></div>
        <div><p className="eyebrow text-white/40">Explore</p><div className="mt-5 grid gap-3 text-sm"><Link href="/phones">All phones</Link><Link href="/about">About us</Link><Link href="/login">Store portal</Link></div></div>
        <div><p className="eyebrow text-white/40">Visit</p><div className="mt-5 flex gap-3 text-sm leading-6 text-white/70"><MapPin size={17} className="mt-1 shrink-0"/>Mobile Hub, High Street<br/>Open 10am–8pm</div><a href="https://instagram.com" className="mt-4 inline-flex items-center gap-2 text-sm">Instagram <Instagram size={15}/></a></div>
      </div>
      <div className="flex flex-col gap-3 pt-7 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Mobile Hub. All rights reserved.</p><a href="mailto:hello@mobilehub.in" className="flex items-center gap-1 text-white/70">hello@mobilehub.in <ArrowUpRight size={13}/></a></div>
    </div>
  </footer>;
}
