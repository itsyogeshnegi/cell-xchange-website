import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { discountedPrice, formatPrice } from "@/utils/format";

export default function PhoneCard({ phone }) {
  const href = `/phones/${phone._id}`;
  return <article className="group overflow-hidden rounded-[22px] border border-[#e7e9e7] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(20,35,26,.09)]">
    <Link href={href} className="relative block aspect-[1.02] overflow-hidden bg-[#f3f4f2]">
      <Image src={phone.images?.[0]?.url} alt={`${phone.brand} ${phone.model}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition duration-500 group-hover:scale-[1.035]" />
      <div className="absolute left-4 top-4 flex gap-2"><span className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider ${phone.stock ? "bg-white/90 text-[#173f2c]" : "bg-[#272727] text-white"}`}>{phone.stock ? "In stock" : "Sold out"}</span>{phone.latest && <span className="rounded-full bg-[#d9f99d] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider">New</span>}</div>
    </Link>
    <div className="p-5">
      <div className="flex items-start justify-between gap-3"><div><p className="eyebrow text-[#7c8580]">{phone.brand}</p><h3 className="mt-1.5 text-[17px] font-bold tracking-[-.03em]">{phone.model}</h3></div><Link href={href} aria-label={`View ${phone.model}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#e2e5e2] group-hover:bg-[#173f2c] group-hover:text-white"><ArrowUpRight size={16}/></Link></div>
      <div className="mt-5 flex items-end justify-between border-t border-[#eceeec] pt-4"><div className="flex gap-1.5 text-[11px] font-semibold text-[#6d756f]"><span>{phone.storage}</span><span>·</span><span>{phone.color}</span></div><div className="text-right"><p className="text-[16px] font-extrabold">{formatPrice(discountedPrice(phone.price, phone.discount))}</p>{phone.discount > 0 && <p className="text-[10px] text-[#929892] line-through">{formatPrice(phone.price)}</p>}</div></div>
    </div>
  </article>;
}
