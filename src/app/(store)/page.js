import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import PhoneCard from "@/components/phones/PhoneCard";
import { brands } from "@/lib/demo-data";
import { getPhones } from "@/services/phoneService";
import { getStoreProfile } from "@/services/settingsService";
import { discountedPrice, formatPrice } from "@/utils/format";

export const dynamic = "force-dynamic";

function FeaturedPhone({ phone }) {
  const href = `/phones/${phone._id}`;

  return (
    <article className="grid overflow-hidden border border-[#dedfdd] bg-[#f5f5f2] lg:grid-cols-[1.08fr_.92fr]">
      <Link href={href} className="group relative min-h-[390px] overflow-hidden bg-[#ececea] sm:min-h-[520px]">
        <Image
          src={phone.images?.[0]?.url}
          alt={`${phone.brand} ${phone.model}`}
          fill
          sizes="(min-width: 1024px) 54vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-[1.025]"
        />
        <div className="absolute left-5 top-5 flex gap-2">
          <span className="bg-white/90 px-3 py-2 text-[9px] font-bold uppercase tracking-[.14em] backdrop-blur">
            {phone.stock ? "Available now" : "Sold out"}
          </span>
          {phone.latest && <span className="bg-[#1f55ff] px-3 py-2 text-[9px] font-bold uppercase tracking-[.14em] text-white">New arrival</span>}
        </div>
      </Link>

      <div className="flex flex-col justify-between p-7 sm:p-11 lg:p-14">
        <div>
          <p className="eyebrow text-[#777a80]">Featured in store · {phone.brand}</p>
          <h3 className="display mt-5 text-5xl font-semibold leading-none sm:text-6xl">{phone.model}</h3>
          {phone.description && <p className="mt-6 line-clamp-4 max-w-md text-sm leading-7 text-[#65686e]">{phone.description}</p>}
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 border-y border-black/10 py-5 text-sm">
            <span><strong className="block text-[10px] uppercase tracking-[.14em] text-[#85888e]">Storage</strong><span className="mt-1 block font-semibold">{phone.storage}</span></span>
            <span><strong className="block text-[10px] uppercase tracking-[.14em] text-[#85888e]">Condition</strong><span className="mt-1 block font-semibold">{phone.condition}</span></span>
            <span><strong className="block text-[10px] uppercase tracking-[.14em] text-[#85888e]">Colour</strong><span className="mt-1 block font-semibold">{phone.color}</span></span>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-[#85888e]">{phone.discount > 0 ? "Offer price" : "Store price"}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="text-3xl font-semibold">{formatPrice(discountedPrice(phone.price, phone.discount))}</p>
              {phone.discount > 0 && <span className="bg-[#1f55ff] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[.1em] text-white">{phone.discount}% off</span>}
            </div>
            {phone.discount > 0 && <p className="mt-2 text-sm text-[#8a8d92]">MRP <span className="line-through">{formatPrice(phone.price)}</span></p>}
          </div>
          <Link href={href} className="inline-flex items-center gap-3 bg-black px-6 py-4 text-xs font-bold uppercase tracking-[.12em] text-white hover:bg-[#1f55ff]">
            View phone <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function HomePage() {
  const store = await getStoreProfile();
  const phones = await getPhones({}, 4);
  const [featuredPhone, ...morePhones] = phones;
  const stockUpdatesUrl = `https://wa.me/${store.phoneE164.replace("+", "")}?text=${encodeURIComponent(`Hi ${store.name}, please share your latest phone stock and offers.`)}`;

  return (
    <>
      <section className="overflow-hidden bg-[#f3f3f0]">
        <div className="container-shell grid items-stretch lg:min-h-[690px] lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative z-10 flex flex-col justify-center py-16 pr-0 lg:py-24 lg:pr-16">
            <p className="eyebrow flex items-center gap-3 text-[#62656b]"><span className="h-px w-8 bg-black" />Independent mobile store · Vasant Kunj</p>
            <h1 className="display mt-7 max-w-3xl text-[44px] font-semibold leading-[.94] sm:text-[66px] lg:text-[77px]">A better phone.<br /><span className="text-[#6c7078]">A simpler choice.</span></h1>
            <p className="mt-7 max-w-xl text-[16px] leading-7 text-[#5f6268]">Verified devices, honest condition details and a local team you can message before you visit.</p>
            <div className="mt-9 flex   flex-wrap gap-3">
              <Link href="#latest" className="inline-flex items-center gap-3 bg-black px-6 py-4 text-xs font-bold uppercase tracking-[.12em] text-white hover:bg-[#1f55ff]">See today&apos;s phones <ArrowRight size={15} /></Link>
              <a href={store.whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 border border-black/20 bg-white px-6 py-4 text-xs font-bold uppercase tracking-[.12em] hover:border-black"><MessageCircle size={15} /> Tell us what you need</a>
            </div>
            <p className="mt-6 text-xs leading-5 text-[#777a80]">Stock changes often. Save our WhatsApp and check what&apos;s new before making the trip.</p>
          </div>

          <div className="relative min-h-[510px] overflow-hidden lg:min-h-full">
            <Image src="/hero-black" alt="Black iPhone available from cell.xchange" fill priority sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
            <div className="absolute right-6 top-6 border border-white/25 bg-black/80 px-5 py-4 text-white backdrop-blur-sm sm:right-8 sm:top-8">
              <p className="eyebrow text-white/60">Open every day</p>
              <p className="mt-2 text-sm font-bold">12 PM — 10 PM</p>
            </div>
            <p className="eyebrow absolute bottom-7 left-7 text-white/70 sm:bottom-9 sm:left-9">Phones · Accessories · Exchange</p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#dedfdd] bg-white">
        <div className="container-shell grid divide-y divide-[#dedfdd] md:grid-cols-3 md:divide-x md:divide-y-0">
          <a href={store.mapUrl} target="_blank" rel="noreferrer" className="flex gap-4 py-6 md:px-7 md:first:pl-0"><MapPin size={19} className="mt-1 shrink-0" /><div><p className="eyebrow text-[#85888e]">Find us</p><p className="mt-2 text-sm font-semibold">Kishan Garh, Vasant Kunj</p></div></a>
          <div className="flex gap-4 py-6 md:px-7"><Clock3 size={19} className="mt-1 shrink-0" /><div><p className="eyebrow text-[#85888e]">Shop hours</p><p className="mt-2 text-sm font-semibold">{store.hours} · All 7 days</p></div></div>
          <a href={`tel:${store.phoneE164}`} className="flex gap-4 py-6 md:px-7"><Phone size={19} className="mt-1 shrink-0" /><div><p className="eyebrow text-[#85888e]">Call the shop</p><p className="mt-2 text-sm font-semibold">{store.phoneDisplay}</p></div></a>
        </div>
      </section>

      <nav aria-label="Shop by brand" className="border-b border-[#e2e2df] py-6">
        <div className="container-shell flex items-center gap-8 overflow-x-auto no-scrollbar">
          <span className="eyebrow shrink-0 text-[#9a9ca0]">Shop by brand</span>
          {brands.map((brand) => <Link key={brand} href={`/phones?brand=${encodeURIComponent(brand)}`} className="shrink-0 text-sm font-semibold text-[#4f5258] hover:text-[#1f55ff]">{brand}</Link>)}
        </div>
      </nav>

      <section id="latest" className="container-shell scroll-mt-24 py-20 sm:py-28">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div><p className="eyebrow text-[#74777d]">In store now</p><h2 className="display mt-4 text-4xl font-semibold sm:text-6xl">Start with what&apos;s here.</h2></div>
          <Link href="/phones" className="hidden items-center gap-2 border-b border-black pb-1 text-xs font-bold uppercase tracking-[.1em] sm:flex">Browse all <ArrowRight size={14} /></Link>
        </div>

        {featuredPhone ? <>
          <FeaturedPhone phone={featuredPhone} />
          {morePhones.length > 0 && <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{morePhones.map((phone) => <PhoneCard key={phone._id} phone={phone} />)}</div>}
        </> : <div className="border border-[#dedfdd] bg-[#f7f7f5] px-6 py-16 text-center"><p className="text-xl font-semibold">Fresh stock is being prepared.</p><p className="mt-3 text-sm text-[#74777d]">Message us for today&apos;s availability.</p><a href={store.whatsappUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex bg-black px-6 py-4 text-xs font-bold uppercase tracking-[.12em] text-white">Ask on WhatsApp</a></div>}
      </section>

      <section className="bg-[#0b0c0e] py-20 text-white sm:py-24">
        <div className="container-shell grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <p className="eyebrow text-[#7ea0ff]">Your direct line to the store</p>
            <h2 className="display mt-5 max-w-3xl text-5xl font-semibold leading-[.96] sm:text-7xl">New stock moves fast.<br /><span className="text-white/40">Stay close.</span></h2>
          </div>
          <div className="border-l border-white/15 pl-0 lg:pl-10">
            <p className="max-w-md text-sm leading-7 text-white/55">Save cell.xchange on WhatsApp. Ask for fresh arrivals, prices or a specific model whenever you&apos;re ready—no forms and no sales queue.</p>
            <a href={stockUpdatesUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-3 bg-white px-6 py-4 text-xs font-bold uppercase tracking-[.12em] text-black hover:bg-[#1f55ff] hover:text-white"><MessageCircle size={16} /> Check latest stock</a>
          </div>
        </div>
      </section>

      <section className="border-b border-[#dedfdd] bg-white">
        <div className="container-shell grid md:grid-cols-3">
          {[
            [BadgeCheck, "Checked before listing", "Clear condition and specifications before you decide."],
            [RefreshCw, "Straightforward exchange", "Bring your current phone for an in-store assessment."],
            [ShieldCheck, "A shop you can return to", "Real local support before and after your purchase."],
          ].map(([Icon, title, text], index) => <div key={title} className={`py-10 md:px-8 md:py-14 ${index ? "border-t border-[#dedfdd] md:border-l md:border-t-0" : ""}`}><Icon size={21} /><h3 className="mt-8 text-lg font-semibold">{title}</h3><p className="mt-3 max-w-xs text-sm leading-6 text-[#6c6f75]">{text}</p></div>)}
        </div>
      </section>

      <section className="container-shell py-20 sm:py-28">
        <div className="grid overflow-hidden border border-[#dedfdd] lg:grid-cols-[1.08fr_.92fr]">
          <div className="p-8 sm:p-14">
            <p className="eyebrow text-[#74777d]">Visit cell.xchange</p>
            <h2 className="display mt-5 max-w-xl text-4xl font-semibold leading-[1.02] sm:text-6xl">See the phone.<br />Make the right call.</h2>
            <p className="mt-6 max-w-lg text-sm leading-7 text-[#666970]">Open every day from {store.hours}. Walk in, call ahead or message us to confirm availability.</p>
            <div className="mt-9 flex flex-wrap gap-3"><a href={store.mapUrl} target="_blank" rel="noreferrer" className="bg-[#1f55ff] px-6 py-4 text-xs font-bold uppercase tracking-[.12em] text-white">Get directions</a><a href={`tel:${store.phoneE164}`} className="border border-black px-6 py-4 text-xs font-bold uppercase tracking-[.12em]">Call {store.phoneDisplay}</a></div>
          </div>
          <div className="technical-grid min-h-72 border-t border-[#dedfdd] bg-[#f2f2ef] p-7 lg:border-l lg:border-t-0">
            <div className="flex h-full flex-col justify-end border border-black/10 bg-white/90 p-7 backdrop-blur"><MapPin size={20} /><p className="eyebrow mt-10 text-[#74777d]">Address</p><p className="mt-4 text-xl font-semibold leading-8">{store.addressLine1}</p><p className="mt-3 text-sm leading-6 text-[#65686e]">{store.addressLine2}</p></div>
          </div>
        </div>
      </section>
    </>
  );
}
