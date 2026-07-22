import Link from "next/link";

export default function Logo({ compact = false, light = false, name = "cell.xchange" }) {
  return <Link href="/" aria-label={`${name} home`} className={`inline-flex items-center gap-3 font-semibold tracking-[-.045em] ${light ? "text-white" : "text-[#0b0c0e]"}`}>
    <span className={`grid h-8 w-8 place-items-center rounded-[7px] border text-[10px] font-black tracking-[-.08em] ${light ? "border-white/25 bg-white text-black" : "border-black bg-black text-white"}`}>c.x</span>
    {!compact && <span className="text-[18px]">{name}</span>}
  </Link>;
}
