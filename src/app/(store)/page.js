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
import FeaturedCarousel from "@/components/phones/FeaturedCarousel";
import HeroImageCarousel from "@/components/layout/HeroImageCarousel";
import { deviceFilterOptions } from "@/lib/device-filters";
import { getPhones } from "@/services/phoneService";
import { getStoreProfile } from "@/services/settingsService";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const store = await getStoreProfile();
  const phones = await getPhones({ featured: true }, 8);
  const stockUpdatesUrl = `https://wa.me/${store.phoneE164.replace("+", "")}?text=${encodeURIComponent(`Hi ${store.name}, please share your latest phone stock and offers.`)}`;
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(`${store.name}, ${store.addressLine1}, ${store.addressLine2}`)}&output=embed`;

  return (
    <>
      <section className="overflow-hidden bg-[#f3f3f0]">
        <div className="container-shell grid items-stretch lg:min-h-[690px] lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative z-10 flex flex-col justify-center py-16 pr-0 lg:py-24 lg:pr-16">
            <p className="eyebrow flex items-center gap-3 text-[#62656b]"><span className="h-px w-8 bg-black" />{store.heroEyebrow}</p>
            <h1 className="display mt-7 max-w-3xl text-[44px] font-semibold leading-[.94] sm:text-[66px] lg:text-[77px]">{store.heroTitle}<br /><span className="text-[#6c7078]">{store.heroTitleAccent}</span></h1>
            <p className="mt-7 max-w-xl text-[16px] leading-7 text-[#5f6268]">{store.heroDescription}</p>
            <div className="mt-9 flex   flex-wrap gap-3">
              <Link href="/phones" className="inline-flex items-center gap-3 bg-black px-6 py-4 text-xs font-bold uppercase tracking-[.12em] text-white hover:bg-[#1f55ff]">{store.heroPrimaryCta} <ArrowRight size={15} /></Link>
              <a href={store.whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 border border-black/20 bg-white px-6 py-4 text-xs font-bold uppercase tracking-[.12em] hover:border-black"><MessageCircle size={15} /> {store.heroSecondaryCta}</a>
            </div>
            <p className="mt-6 text-xs leading-5 text-[#777a80]">Stock changes often. Save our WhatsApp and check what&apos;s new before making the trip.</p>
          </div>

          <div className="relative min-h-[510px] overflow-hidden lg:min-h-full">
            <HeroImageCarousel images={store.heroImages} alt={store.heroImageAlt} bannerText={store.heroBannerText}/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
            <div className="absolute right-6 top-6 border border-white/25 bg-black/80 px-5 py-4 text-white backdrop-blur-sm sm:right-8 sm:top-8">
              <p className="eyebrow text-white/60">{store.days}</p>
              <p className="mt-2 text-sm font-bold">{store.hours}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#dedfdd] bg-white">
        <div className="container-shell grid divide-y divide-[#dedfdd] md:grid-cols-3 md:divide-x md:divide-y-0">
          <a href={store.mapUrl} target="_blank" rel="noreferrer" className="flex gap-4 py-6 md:px-7 md:first:pl-0"><MapPin size={19} className="mt-1 shrink-0" /><div><p className="eyebrow text-[#85888e]">Find us</p><p className="mt-2 text-sm font-semibold">{store.addressLine1}</p></div></a>
          <div className="flex gap-4 py-6 md:px-7"><Clock3 size={19} className="mt-1 shrink-0" /><div><p className="eyebrow text-[#85888e]">Shop hours</p><p className="mt-2 text-sm font-semibold">{store.hours} · All 7 days</p></div></div>
          <a href={`tel:${store.phoneE164}`} className="flex gap-4 py-6 md:px-7"><Phone size={19} className="mt-1 shrink-0" /><div><p className="eyebrow text-[#85888e]">Call the shop</p><p className="mt-2 text-sm font-semibold">{store.phoneDisplay}</p></div></a>
        </div>
      </section>

      <nav aria-label="Shop by device family" className="border-b border-[#e2e2df] py-6">
        <div className="container-shell flex items-center gap-8 overflow-x-auto no-scrollbar">
          <span className="eyebrow shrink-0 text-[#9a9ca0]">Shop by device</span>
          {deviceFilterOptions.slice(1).map(({ value, label }) => <Link key={value} href={`/phones?device=${encodeURIComponent(value)}`} className="shrink-0 text-sm font-semibold text-[#4f5258] hover:text-[#1f55ff]">{label}</Link>)}
        </div>
      </nav>

      <section id="latest" className="container-shell scroll-mt-24 py-20 sm:py-28">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div><p className="eyebrow text-[#74777d]">{store.latestEyebrow}</p><h2 className="display mt-4 text-4xl font-semibold sm:text-6xl">{store.latestTitle}</h2></div>
          <Link href="/phones" className="hidden items-center gap-2 border-b border-black pb-1 text-xs font-bold uppercase tracking-[.1em] sm:flex">Browse all <ArrowRight size={14} /></Link>
        </div>

        {phones.length ? <FeaturedCarousel phones={phones}/> : <div className="border border-[#dedfdd] bg-[#f7f7f5] px-6 py-16 text-center"><p className="text-xl font-semibold">Fresh stock is being prepared.</p><p className="mt-3 text-sm text-[#74777d]">Message us for today&apos;s availability.</p><a href={store.whatsappUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex bg-black px-6 py-4 text-xs font-bold uppercase tracking-[.12em] text-white">Ask on WhatsApp</a></div>}
      </section>

      <section className="bg-[#0b0c0e] py-20 text-white sm:py-24">
        <div className="container-shell grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <p className="eyebrow text-[#7ea0ff]">{store.stockEyebrow}</p>
            <h2 className="display mt-5 max-w-3xl text-5xl font-semibold leading-[.96] sm:text-7xl">{store.stockTitle}<br /><span className="text-white/40">{store.stockTitleAccent}</span></h2>
          </div>
          <div className="border-l border-white/15 pl-0 lg:pl-10">
            <p className="max-w-md text-sm leading-7 text-white/55">{store.stockDescription}</p>
            <a href={stockUpdatesUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-3 bg-white px-6 py-4 text-xs font-bold uppercase tracking-[.12em] text-black hover:bg-[#1f55ff] hover:text-white"><MessageCircle size={16} /> {store.stockCta}</a>
          </div>
        </div>
      </section>

      <section className="border-b border-[#dedfdd] bg-white">
        <div className="container-shell grid md:grid-cols-3">
          {[
            [BadgeCheck, store.trustTitle1, store.trustText1],
            [RefreshCw, store.trustTitle2, store.trustText2],
            [ShieldCheck, store.trustTitle3, store.trustText3],
          ].map(([Icon, title, text], index) => <div key={title} className={`py-10 md:px-8 md:py-14 ${index ? "border-t border-[#dedfdd] md:border-l md:border-t-0" : ""}`}><Icon size={21} /><h3 className="mt-8 text-lg font-semibold">{title}</h3><p className="mt-3 max-w-xs text-sm leading-6 text-[#6c6f75]">{text}</p></div>)}
        </div>
      </section>

      <section className="container-shell py-20 sm:py-28">
        <div className="grid overflow-hidden border border-[#dedfdd] lg:grid-cols-[1.08fr_.92fr]">
          <div className="p-8 sm:p-14">
            <p className="eyebrow text-[#74777d]">{store.visitEyebrow}</p>
            <h2 className="display mt-5 max-w-xl text-4xl font-semibold leading-[1.02] sm:text-6xl">{store.visitTitle}<br />{store.visitTitleAccent}</h2>
            <p className="mt-6 max-w-lg text-sm leading-7 text-[#666970]">{store.visitDescription}</p>
            <div className="mt-9 flex flex-wrap gap-3"><a href={store.mapUrl} target="_blank" rel="noreferrer" className="bg-[#1f55ff] px-6 py-4 text-xs font-bold uppercase tracking-[.12em] text-white">{store.directionsCta}</a><a href={`tel:${store.phoneE164}`} className="border border-black px-6 py-4 text-xs font-bold uppercase tracking-[.12em]">Call {store.phoneDisplay}</a></div>
          </div>
          <div className="relative min-h-[360px] overflow-hidden border-t border-[#dedfdd] bg-[#f2f2ef] lg:min-h-full lg:border-l lg:border-t-0">
            <iframe
              src={mapEmbedUrl}
              title={`${store.name} location on Google Maps`}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a href={store.mapUrl} target="_blank" rel="noreferrer" className="absolute bottom-4 left-4 right-4 flex items-start gap-3 border border-black/10 bg-white/95 p-4 shadow-lg backdrop-blur sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm">
              <MapPin size={18} className="mt-0.5 shrink-0"/>
              <span><strong className="block text-xs">{store.addressLine1}</strong><span className="mt-1 block text-[10px] leading-5 text-[#65686e]">{store.addressLine2}</span></span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
