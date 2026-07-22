import Link from "next/link";
import { ArrowUpRight, Clock3, Mail, MapPin, Phone } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { store } from "@/lib/store";

export default function Footer() {
  return <footer className="bg-[#0b0c0e] text-white">
    <div className="container-shell py-16 sm:py-20">
      <div className="grid gap-12 border-b border-white/10 pb-14 lg:grid-cols-[1.2fr_.75fr_.9fr]">
        <div><Logo light/><p className="mt-6 max-w-md text-sm leading-7 text-white/50">A trusted local destination for smartphones, exchanges and straightforward buying advice in Vasant Kunj.</p><a href={store.whatsappUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 border-b border-white/30 pb-1 text-xs font-bold uppercase tracking-[.12em]">Start a conversation <ArrowUpRight size={14}/></a></div>
        <div><p className="eyebrow text-white/35">Navigate</p><nav className="mt-6 grid gap-3.5 text-sm text-white/70"><Link href="/phones" className="hover:text-white">Available phones</Link><Link href="/about" className="hover:text-white">Our store</Link><Link href="/about#contact" className="hover:text-white">Contact & directions</Link><Link href="/login" className="hover:text-white">Staff login</Link></nav></div>
        <div><p className="eyebrow text-white/35">Visit cell.xchange</p><div className="mt-6 grid gap-4 text-sm leading-6 text-white/65"><a href={store.mapUrl} target="_blank" rel="noreferrer" className="flex gap-3 hover:text-white"><MapPin size={17} className="mt-1 shrink-0"/><span>{store.addressLine1}<br/>{store.addressLine2}</span></a><div className="flex gap-3"><Clock3 size={17} className="mt-1 shrink-0"/><span>{store.hours}<br/>{store.days}</span></div><a href={`tel:${store.phoneE164}`} className="flex items-center gap-3 hover:text-white"><Phone size={17}/>{store.phoneDisplay}</a></div></div>
      </div>
      <div className="flex flex-col gap-4 pt-7 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} cell.xchange. All rights reserved.</p><a href={`mailto:${store.email}`} className="flex items-center gap-2 text-white/60 hover:text-white"><Mail size={13}/>{store.email}</a></div>
    </div>
  </footer>;
}
