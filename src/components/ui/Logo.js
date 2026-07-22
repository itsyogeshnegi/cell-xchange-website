import Link from "next/link";

export default function Logo({ compact = false, light = false }) {
  return <Link href="/" aria-label="cell.xchange home" className={`inline-flex items-center gap-3 font-semibold tracking-[-.045em] ${light ? "text-white" : "text-[#0b0c0e]"}`}>
    <span className={`grid h-8 w-8 place-items-center rounded-[7px] border text-[10px] font-black tracking-[-.08em] ${light ? "border-white/25 bg-white text-black" : "border-black bg-black text-white"}`}>c.x</span>
    {!compact && <span className="text-[18px]">cell<span className={light ? "text-white/45" : "text-[#9b9da1]"}>.</span>xchange</span>}
  </Link>;
}
