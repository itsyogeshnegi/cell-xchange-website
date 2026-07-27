import Image from "next/image";
import Link from "next/link";

export default function Logo({ compact = false, light = false, logo, name = "cell.xchange" }) {
  if (logo?.url) return <Link href="/" aria-label={`${name} home`} className={`inline-flex items-center ${light ? "rounded-lg bg-white/95 p-1.5" : ""}`}>
    <Image src={logo.url} alt={`${name} logo`} width={compact ? 36 : 180} height={compact ? 36 : 48} className={`${compact ? "h-9 w-9" : "h-10 w-auto max-w-[180px]"} object-contain`}/>
  </Link>;
  return <Link href="/" aria-label={`${name} home`} className={`inline-flex items-center gap-3 font-semibold tracking-[-.045em] ${light ? "text-white" : "text-[#0b0c0e]"}`}>
    <span className={`grid h-8 w-8 place-items-center rounded-[7px] border text-[10px] font-black tracking-[-.08em] ${light ? "border-white/25 bg-white text-black" : "border-black bg-black text-white"}`}>c.x</span>
    {!compact && <span className="text-[18px]">{name}</span>}
  </Link>;
}
