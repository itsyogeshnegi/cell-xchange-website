import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatPrice } from "@/utils/format";

export default function PhoneCard({ phone, compact = false }) {
  const href = `/phones/${phone._id}`;
  return <article className="group border border-[#e0e1df] bg-white transition duration-300 hover:border-[#adafb4] hover:shadow-[0_18px_45px_rgba(15,17,20,.08)]">
    <Link href={href} className={`relative block overflow-hidden bg-[#f1f1ef] ${compact ? "h-[240px] sm:h-[280px] lg:h-[320px]" : "aspect-[1.02]"}`}><Image src={phone.images?.[0]?.url} alt={`${phone.brand} ${phone.model}`} fill sizes={compact ? "(max-width: 640px) 86vw, (max-width: 1024px) 62vw, 52vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"} className={`${compact ? "object-contain p-5 sm:p-7" : "object-cover"} transition duration-700 group-hover:scale-[1.025]`}/><div className="absolute left-4 top-4 flex flex-wrap gap-2"><span className={`border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[.13em] backdrop-blur ${phone.stock ? "border-white/70 bg-white/85 text-black" : "border-black bg-black text-white"}`}>{phone.stock ? "Available" : "Sold out"}</span></div></Link>
    <div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow text-[#85888e]">{phone.category || "Phone"} · {phone.brand}</p><h3 className="mt-2 text-[17px] font-semibold tracking-[-.03em]">{phone.model}</h3></div><Link href={href} aria-label={`View ${phone.model}`} className="grid h-9 w-9 shrink-0 place-items-center border border-[#dfe0de] group-hover:border-black group-hover:bg-black group-hover:text-white"><ArrowUpRight size={15}/></Link></div><div className="mt-6 flex items-end justify-between border-t border-[#e7e7e4] pt-4"><div className="flex gap-1.5 text-[10px] font-semibold text-[#777a80]">{phone.ram && <span>{phone.ram} RAM</span>}{phone.ram && phone.storage && <span>·</span>}{phone.storage && <span>{phone.storage}</span>}</div><p className="text-[16px] font-semibold">{formatPrice(phone.price)}</p></div></div>
  </article>;
}
