function Pulse({ className = "" }) { return <div className={`animate-pulse rounded-xl bg-[#e9ece8] ${className}`} />; }

export function PhoneGridSkeleton({ count = 6 }) {
  return <div aria-label="Loading phones" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: count }, (_, index) => <div key={index} className="overflow-hidden rounded-[22px] border border-[#e7e9e7] bg-white"><Pulse className="aspect-[1.02] rounded-none"/><div className="p-5"><Pulse className="h-3 w-16"/><Pulse className="mt-3 h-5 w-36"/><div className="mt-6 flex justify-between"><Pulse className="h-3 w-28"/><Pulse className="h-5 w-20"/></div></div></div>)}</div>;
}

export function TableSkeleton() {
  return <div aria-label="Loading inventory" className="overflow-hidden rounded-[22px] border border-[#e1e4e1] bg-white"><div className="p-4"><Pulse className="h-11 w-full"/></div>{Array.from({ length: 6 }, (_, index) => <div key={index} className="flex items-center gap-4 border-t border-[#eceeec] px-5 py-3"><Pulse className="h-12 w-12"/><div className="flex-1"><Pulse className="h-3 w-36"/><Pulse className="mt-2 h-2 w-24"/></div><Pulse className="h-4 w-20"/><Pulse className="h-7 w-20"/></div>)}</div>;
}

export function DetailsSkeleton() {
  return <div className="container-shell grid min-h-[70vh] gap-10 py-14 lg:grid-cols-2"><Pulse className="aspect-square rounded-[28px]"/><div className="py-8"><Pulse className="h-3 w-20"/><Pulse className="mt-5 h-14 w-3/4"/><Pulse className="mt-6 h-4 w-full"/><Pulse className="mt-3 h-4 w-4/5"/><Pulse className="mt-10 h-12 w-40"/><Pulse className="mt-8 h-14 w-full rounded-full"/></div></div>;
}

export function FormSkeleton() {
  return <div className="mx-auto max-w-6xl"><Pulse className="h-10 w-64"/><div className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_.75fr]"><div className="rounded-[22px] bg-white p-7">{Array.from({length:7},(_,index)=><Pulse key={index} className="mb-5 h-12 w-full"/>)}</div><Pulse className="h-80 rounded-[22px]"/></div></div>;
}
