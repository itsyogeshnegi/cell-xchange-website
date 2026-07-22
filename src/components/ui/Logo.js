import Link from "next/link";

export default function Logo({ compact = false, light = false }) {
  return <Link href="/" className={`inline-flex items-center gap-2.5 font-extrabold tracking-[-.04em] ${light ? "text-white" : "text-[#15191d]"}`}>
    <span className={`grid h-8 w-8 place-items-center rounded-[10px] ${light ? "bg-white text-[#183e2d]" : "bg-[#173f2c] text-white"}`}><span className="h-3.5 w-2.5 rounded-[3px] border-2 border-current" /></span>
    {!compact && <span className="text-[17px]">mobile hub<span className="text-[#7d8c84]">.</span></span>}
  </Link>;
}
