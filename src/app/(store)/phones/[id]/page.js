import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, MapPin, ShieldCheck } from "lucide-react";
import PhoneGallery from "@/components/phones/PhoneGallery";
import PhoneCard from "@/components/phones/PhoneCard";
import { phones } from "@/lib/demo-data";
import { store } from "@/lib/store";
import { getPhone, getPhones } from "@/services/phoneService";
import { discountedPrice, formatPrice } from "@/utils/format";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) { const { id } = await params; const phone = await getPhone(id); return phone ? { title: `${phone.brand} ${phone.model}`, description: phone.description } : { title: "Phone not found" }; }
export async function generateStaticParams() { return phones.map((phone) => ({ id: phone._id })); }

export default async function PhoneDetails({ params }) {
  const { id } = await params;
  const phone = await getPhone(id);
  if (!phone) notFound();
  const related = (await getPhones()).filter((item) => item._id !== phone._id).slice(0, 3);
  const specs = [["Storage", phone.storage], ["Memory", phone.ram], ["Battery", phone.battery], ["Processor", phone.processor], ["Display", phone.display], ["Camera", phone.camera], ["Condition", phone.condition], ["Colour", phone.color]];
  const message = encodeURIComponent(`Hi cell.xchange, I'm interested in the ${phone.brand} ${phone.model}. Is it available?`);
  const enquiryUrl = `https://wa.me/${store.phoneE164.replace("+", "")}?text=${message}`;

  return <>
    <section className="container-shell py-8 sm:py-14"><Link href="/phones" className="mb-9 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#686b71]"><ArrowLeft size={14}/> Back to all phones</Link><div className="grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16"><PhoneGallery phone={phone}/><div className="lg:py-7"><div className="flex items-center gap-2"><span className="eyebrow text-[#777a80]">{phone.brand}</span>{phone.latest && <span className="bg-[#1f55ff] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-white">New arrival</span>}</div><h1 className="display mt-4 text-5xl font-semibold sm:text-6xl">{phone.model}</h1><p className="mt-6 max-w-xl text-sm leading-7 text-[#62656b]">{phone.description}</p><div className="mt-9 flex items-end gap-3"><span className="text-3xl font-semibold tracking-[-.04em]">{formatPrice(discountedPrice(phone.price, phone.discount))}</span>{phone.discount > 0 && <span className="pb-1 text-sm text-[#92959a] line-through">{formatPrice(phone.price)}</span>}</div><div className={`mt-5 inline-flex items-center gap-2 border px-3 py-2 text-[10px] font-bold uppercase tracking-[.1em] ${phone.stock ? "border-[#b9d9c3] bg-[#f0f8f2] text-[#24613d]" : "border-[#e5cccc] bg-[#faf2f2] text-[#8a3838]"}`}><span className={`h-1.5 w-1.5 rounded-full ${phone.stock ? "bg-[#37a35f]" : "bg-[#b85454]"}`}/>{phone.stock ? `${phone.stock} ready for collection` : "Currently out of stock"}</div><a href={enquiryUrl} target="_blank" rel="noreferrer" className="mt-9 flex w-full items-center justify-center bg-black px-6 py-4 text-xs font-bold uppercase tracking-[.12em] text-white hover:bg-[#1f55ff]">Ask about this phone on WhatsApp</a><div className="mt-5 grid grid-cols-2 border border-[#e1e2df]"><div className="flex gap-3 border-r border-[#e1e2df] p-4"><ShieldCheck size={18}/><span className="text-xs font-semibold leading-5">Condition<br/>verified</span></div><div className="flex gap-3 p-4"><MapPin size={18}/><span className="text-xs font-semibold leading-5">Collect in<br/>Vasant Kunj</span></div></div></div></div></section>
    <section className="border-y border-[#e1e2df] bg-[#f6f6f3] py-20"><div className="container-shell grid gap-12 lg:grid-cols-[.65fr_1.35fr]"><div><p className="eyebrow text-[#777a80]">Specifications</p><h2 className="display mt-4 text-4xl font-semibold">Every detail,<br/>made clear.</h2></div><dl className="grid sm:grid-cols-2">{specs.map(([name, value]) => <div key={name} className="border-b border-[#dfe0dd] py-5 sm:mr-10"><dt className="text-[9px] font-bold uppercase tracking-[.14em] text-[#8b8e93]">{name}</dt><dd className="mt-2 text-sm font-semibold">{value || "—"}</dd></div>)}</dl></div></section>
    {related.length > 0 && <section className="container-shell py-20"><div className="mb-10 flex items-end justify-between"><div><p className="eyebrow text-[#777a80]">Continue browsing</p><h2 className="display mt-4 text-4xl font-semibold">You may also consider.</h2></div><Check className="text-[#777a80]"/></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <PhoneCard key={item._id} phone={item}/>)}</div></section>}
  </>;
}
