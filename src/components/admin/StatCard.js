export default function StatCard({ label, value, change, icon: Icon, tone = "blue" }) {
  const tones = { blue: "bg-[#dfe6ff]", white: "bg-white", dark: "bg-[#0b0c0e] text-white", peach: "bg-[#f2e7df]" };
  return <div className={`rounded-[16px] border border-black/[.06] p-5 ${tones[tone]}`}><div className="flex items-start justify-between"><span className="text-xs font-semibold opacity-60">{label}</span><span className="grid h-9 w-9 place-items-center rounded-full bg-white/65"><Icon size={17}/></span></div><p className="mt-6 text-3xl font-semibold tracking-[-.04em]">{value}</p>{change && <p className="mt-2 text-[10px] font-semibold opacity-55">{change}</p>}</div>;
}
