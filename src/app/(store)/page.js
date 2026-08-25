import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import HeroImageCarousel from "@/components/layout/HeroImageCarousel";
import FeaturedCarousel from "@/components/phones/FeaturedCarousel";
import { deviceFilterOptions } from "@/lib/device-filters";
import { getPhones } from "@/services/phoneService";
import { getStoreProfile } from "@/services/settingsService";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const store = await getStoreProfile();
  const phones = await getPhones({ featured: true }, 8);
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(`${store.name}, ${store.addressLine1}, ${store.addressLine2}`)}&output=embed`;

  return <>
    <section className="bg-white py-8 sm:py-12">
      <div className="container-shell">
        <div className="relative min-h-[230px] overflow-hidden border border-black/10 bg-black sm:min-h-[340px] lg:min-h-[430px]">
          <HeroImageCarousel images={store.heroImages} alt={store.heroImageAlt} bannerText={store.heroBannerText}/>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/5"/>
        </div>

        <div className="mx-auto max-w-4xl py-14 text-center sm:py-20">
          <p className="eyebrow text-[#6d7177]">{store.heroEyebrow}</p>
          <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-[-.035em] sm:text-6xl">
            {store.heroTitle}<br/><span className="text-[#74787f]">{store.heroTitleAccent}</span>
          </h1>
          <p className="mx-auto mt-7 max-w-3xl text-sm font-semibold leading-7 text-[#555a61] sm:text-base">{store.heroDescription}</p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={store.whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-16 w-full items-center justify-center gap-3 rounded-xl bg-[#20b83f] px-8 py-4 text-sm font-black uppercase tracking-[.08em] text-white shadow-[0_10px_28px_rgba(32,184,63,.2)] transition hover:bg-[#159c32] sm:w-auto">
              <MessageCircle size={24}/> {store.heroSecondaryCta}
            </a>
            <Link href="/phones" className="inline-flex min-h-16 w-full items-center justify-center gap-3 bg-black px-8 py-4 text-sm font-black uppercase tracking-[.08em] text-white transition hover:bg-[#282828] sm:w-auto">
              {store.heroPrimaryCta} <ArrowRight size={18}/>
            </Link>
          </div>
        </div>

        <div className="border-y border-[#d8d9d7] py-8 text-center">
          <p className="eyebrow text-[#74787d]">{store.stockEyebrow}</p>
          <h2 className="mt-3 text-2xl font-black uppercase tracking-[-.02em] sm:text-3xl">{store.stockTitle} <span className="text-[#74787f]">{store.stockTitleAccent}</span></h2>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {deviceFilterOptions.slice(1).map(({ value, label }) => <Link key={value} href={`/phones?device=${encodeURIComponent(value)}`} className="flex min-h-12 items-center justify-center rounded bg-[#2d2d30] px-4 py-3 text-xs font-bold text-white transition hover:bg-black">{label}</Link>)}
          </div>
        </div>
      </div>
    </section>

    <section id="latest" className="container-shell py-16 sm:py-24">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div><p className="eyebrow text-[#74777d]">{store.latestEyebrow}</p><h2 className="display mt-4 text-4xl font-semibold sm:text-6xl">{store.latestTitle}</h2></div>
        <Link href="/phones" className="hidden items-center gap-2 border-b border-black pb-1 text-xs font-bold uppercase tracking-[.1em] sm:flex">{store.heroPrimaryCta} <ArrowRight size={14}/></Link>
      </div>
      {phones.length ? <FeaturedCarousel phones={phones}/> : <div className="border border-[#dedfdd] bg-[#f7f7f5] px-6 py-16 text-center"><p className="text-xl font-semibold">{store.stockTitle}</p><p className="mt-3 text-sm text-[#74777d]">{store.stockDescription}</p><a href={store.whatsappUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex bg-black px-6 py-4 text-xs font-bold uppercase tracking-[.12em] text-white">{store.stockCta}</a></div>}
    </section>

    <section className="border-y border-[#dedfdd] bg-[#f2f1ee]">
      <div className="container-shell grid md:grid-cols-3">
        {[
          [BadgeCheck, store.trustTitle1, store.trustText1],
          [RefreshCw, store.trustTitle2, store.trustText2],
          [ShieldCheck, store.trustTitle3, store.trustText3],
        ].map(([Icon, title, text], index) => <div key={title} className={`py-10 text-center md:px-8 md:py-14 ${index ? "border-t border-[#d5d4d0] md:border-l md:border-t-0" : ""}`}><Icon size={23} className="mx-auto"/><h3 className="mt-6 text-lg font-black">{title}</h3><p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-[#62666c]">{text}</p></div>)}
      </div>
    </section>

    <section id="contact" className="bg-[#e7e5e1] py-16 sm:py-24">
      <div className="container-shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-[#70747a]">{store.visitEyebrow}</p>
          <h2 className="mt-4 text-3xl font-black sm:text-5xl">{store.visitTitle} <span className="text-[#74787f]">{store.visitTitleAccent}</span></h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#5f646a]">{store.visitDescription}</p>
          <div className="mt-8 grid gap-3 text-sm font-bold sm:grid-cols-3">
            <div className="flex items-center justify-center gap-2 bg-white p-4"><Clock3 size={17}/>{store.hours} · {store.days}</div>
            <a href={store.mapUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-white p-4 hover:bg-black hover:text-white"><MapPin size={17}/>{store.addressLine1}</a>
            <a href={`tel:${store.phoneE164}`} className="flex items-center justify-center gap-2 bg-white p-4 hover:bg-black hover:text-white"><Phone size={17}/>{store.phoneDisplay}</a>
          </div>
        </div>

        <div className="relative mt-10 min-h-[360px] overflow-hidden border border-black/10 bg-[#d5d5d2] sm:min-h-[460px]">
          <iframe src={mapEmbedUrl} title={`${store.name} location on Google Maps`} className="absolute inset-0 h-full w-full border-0" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"/>
          <a href={store.mapUrl} target="_blank" rel="noreferrer" className="absolute bottom-4 left-4 right-4 flex items-start gap-3 bg-white/95 p-4 shadow-xl backdrop-blur sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-md"><MapPin size={18} className="mt-0.5 shrink-0"/><span><strong className="block text-xs">{store.addressLine1}</strong><span className="mt-1 block text-[10px] leading-5 text-[#65686e]">{store.addressLine2}</span></span></a>
        </div>
      </div>
    </section>
  </>;
}
