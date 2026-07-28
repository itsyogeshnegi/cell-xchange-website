import Link from "next/link";
import { ArrowUpRight, Clock3, Instagram, Mail, MapPin, Phone, Star, Youtube } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { store } from "@/lib/store";

export default function Footer({ profile = store }) {
  return <footer className="bg-[#0b0c0e] text-white">
    <div className="container-shell py-16 sm:py-20">
      <div className="grid gap-12 border-b border-white/10 pb-14 lg:grid-cols-[1.2fr_.75fr_.9fr]">
        <div>
          <Logo light logo={profile.brandLogo} name={profile.name}/>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/50">{profile.footerDescription}</p>
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <a href={profile.whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border-b border-white/30 pb-1 text-xs font-bold uppercase tracking-[.12em]">Start a conversation <ArrowUpRight size={14}/></a>
            <a
              href="https://www.google.com/maps/place//data=!4m3!3m2!1s0x390d1f917c88b405:0x18c181d1bef1906c!12e1?source=g.page.m.ia._&laa=nmx-review-solicitation-ia2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-xs font-bold uppercase tracking-[.12em] transition hover:border-white hover:bg-white hover:text-black"
            >
              <Star size={15} aria-hidden="true"/>
              Review us on Google
              <ArrowUpRight size={14} aria-hidden="true"/>
            </a>
          </div>
          <div className="mt-6 flex items-center gap-3" aria-label="Social media links">
            {profile.showInstagram && profile.instagramUrl && <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Visit us on Instagram" className="grid size-10 place-items-center rounded-full border border-white/20 text-white/70 transition hover:border-white hover:bg-white hover:text-black"><Instagram size={18} aria-hidden="true"/></a>}
            {profile.showYoutube && profile.youtubeUrl && <a href={profile.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="Visit us on YouTube" className="grid size-10 place-items-center rounded-full border border-white/20 text-white/70 transition hover:border-white hover:bg-white hover:text-black"><Youtube size={19} aria-hidden="true"/></a>}
            {profile.showWhatsapp && profile.footerWhatsappUrl && <a href={profile.footerWhatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" className="grid size-10 place-items-center rounded-full border border-white/20 text-white/70 transition hover:border-white hover:bg-white hover:text-black"><svg aria-hidden="true" viewBox="0 0 32 32" className="size-[19px] fill-current"><path d="M16.04 3C8.84 3 3 8.73 3 15.8c0 2.25.6 4.45 1.74 6.37L3 28.5l6.58-1.69a13.18 13.18 0 0 0 6.46 1.65C23.24 28.46 29 22.74 29 15.8 29 8.73 23.24 3 16.04 3Zm0 23.3c-2.02 0-4-.53-5.72-1.54l-.41-.24-3.91 1 1.04-3.73-.27-.42a10.52 10.52 0 0 1-1.63-5.57c0-5.87 4.88-10.64 10.9-10.64 6 0 10.82 4.77 10.82 10.64 0 5.8-4.82 10.5-10.82 10.5Zm5.98-7.86c-.33-.16-1.95-.94-2.25-1.05-.3-.1-.52-.16-.74.16-.22.32-.85 1.05-1.04 1.26-.19.22-.38.24-.71.08-.33-.16-1.39-.5-2.65-1.6a9.83 9.83 0 0 1-1.84-2.24c-.19-.32-.02-.5.14-.66.15-.14.33-.37.49-.56.17-.18.22-.32.33-.53.11-.21.05-.4-.03-.56-.08-.16-.74-1.74-1.01-2.38-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.88.4-.3.32-1.15 1.1-1.15 2.67 0 1.58 1.18 3.1 1.34 3.31.17.21 2.32 3.46 5.62 4.85.79.33 1.4.53 1.88.68.79.24 1.5.21 2.07.13.63-.09 1.95-.78 2.22-1.53.28-.75.28-1.39.2-1.53-.08-.13-.3-.21-.63-.37Z"/></svg></a>}
          </div>
        </div>
        <div><p className="eyebrow text-white/35">Navigate</p><nav className="mt-6 grid gap-3.5 text-sm text-white/70"><Link href="/phones" className="hover:text-white">Available devices</Link><Link href="/about" className="hover:text-white">Our store</Link><Link href="/about#contact" className="hover:text-white">Contact & directions</Link></nav></div>
        <div><p className="eyebrow text-white/35">Visit {profile.name}</p><div className="mt-6 grid gap-4 text-sm leading-6 text-white/65"><a href={profile.mapUrl} target="_blank" rel="noreferrer" className="flex gap-3 hover:text-white"><MapPin size={17} className="mt-1 shrink-0"/><span>{profile.addressLine1}<br/>{profile.addressLine2}</span></a><div className="flex gap-3"><Clock3 size={17} className="mt-1 shrink-0"/><span>{profile.hours}<br/>{profile.days}</span></div><a href={`tel:${profile.phoneE164}`} className="flex items-center gap-3 hover:text-white"><Phone size={17}/>{profile.phoneDisplay}</a></div></div>
      </div>
      <div className="flex flex-col gap-4 pt-7 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p><a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-white/60 hover:text-white"><Mail size={13}/>{profile.email}</a></div>
    </div>
  </footer>;
}
