export default function StatCard({ label, value, change, icon: Icon, tone = "blue" }) {
  const tones = { blue: "bg-[#dfe6ff]", white: "bg-white", dark: "bg-[#0b0c0e] text-white", peach: "bg-[#f2e7df]" };
  return <div className={`min-w-0 rounded-[16px] border border-black/[.06] p-4 sm:p-5 ${tones[tone]}`}><div className="flex items-start justify-between gap-3"><span className="text-xs font-semibold opacity-60">{label}</span><span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/65"><Icon size={17}/></span></div><p className="mt-5 break-words text-2xl font-semibold tracking-[-.04em] sm:mt-6 sm:text-3xl">{value}</p>{change && <p className="mt-2 text-[10px] font-semibold opacity-55">{change}</p>}</div>;
}
