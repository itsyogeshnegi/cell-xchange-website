import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { discountedPrice, formatPrice } from "@/utils/format";

export default function PhoneCard({ phone }) {
  const href = `/phones/${phone._id}`;
  return <article className="group border border-[#e0e1df] bg-white transition duration-300 hover:border-[#adafb4] hover:shadow-[0_18px_45px_rgba(15,17,20,.08)]">
    <Link href={href} className="relative block aspect-[1.02] overflow-hidden bg-[#f1f1ef]"><Image src={phone.images?.[0]?.url} alt={`${phone.brand} ${phone.model}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-[1.025]"/><div className="absolute left-4 top-4 flex gap-2"><span className={`border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[.13em] backdrop-blur ${phone.stock ? "border-white/70 bg-white/85 text-black" : "border-black bg-black text-white"}`}>{phone.stock ? "Available" : "Sold out"}</span>{phone.latest && <span className="bg-[#1f55ff] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[.13em] text-white">New</span>}</div></Link>
    <div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow text-[#85888e]">{phone.brand}</p><h3 className="mt-2 text-[17px] font-semibold tracking-[-.03em]">{phone.model}</h3></div><Link href={href} aria-label={`View ${phone.model}`} className="grid h-9 w-9 shrink-0 place-items-center border border-[#dfe0de] group-hover:border-black group-hover:bg-black group-hover:text-white"><ArrowUpRight size={15}/></Link></div><div className="mt-6 flex items-end justify-between border-t border-[#e7e7e4] pt-4"><div className="flex gap-1.5 text-[10px] font-semibold text-[#777a80]"><span>{phone.storage}</span><span>·</span><span>{phone.color}</span></div><div className="text-right"><p className="text-[16px] font-semibold">{formatPrice(discountedPrice(phone.price, phone.discount))}</p>{phone.discount > 0 && <p className="text-[10px] text-[#96999d] line-through">{formatPrice(phone.price)}</p>}</div></div></div>
  </article>;
}
