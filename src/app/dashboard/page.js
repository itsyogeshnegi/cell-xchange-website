import Link from "next/link";
import { ArrowRight, Boxes, CircleX, IndianRupee, PackageCheck } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import { getDashboardStats } from "@/services/dashboardService";
import { formatPrice } from "@/utils/format";

export const dynamic = "force-dynamic";

function getGreeting() {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", hour12: false }).format(new Date()));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

function StatusBadge({ phone }) {
  const available = phone.stock > 0;
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold ${available ? "bg-[#edf7ef] text-[#21603e]" : "bg-[#fff0eb] text-[#a34b32]"}`}>{available ? "Available" : "Sold out"}</span>;
}

export default async function Dashboard() {
  const stats = await getDashboardStats();
  return <div className="mx-auto min-w-0 max-w-7xl">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0"><p className="eyebrow text-[#718078]">Inventory overview</p><h1 className="display mt-2 text-3xl font-black sm:text-4xl">{getGreeting()}, Owner.</h1><p className="mt-2 text-sm text-[#727a74]">Here&apos;s what&apos;s happening with your inventory.</p></div>
      <Link href="/dashboard/phones/create" className="w-full rounded-full bg-[#173f2c] px-5 py-3 text-center text-xs font-bold text-white sm:w-auto">+ Add new phone</Link>
    </div>

    <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      <StatCard label="Total products" value={stats.total} change="Across all inventory" icon={Boxes} tone="blue"/>
      <StatCard label="Available stock" value={stats.available} change="Ready to sell" icon={PackageCheck}/>
      <StatCard label="Out of stock" value={stats.outOfStock} change="Needs attention" icon={CircleX} tone="peach"/>
      <StatCard label="Total cost" value={formatPrice(stats.totalCost)} change="Current inventory value" icon={IndianRupee} tone="dark"/>
    </div>

    <div className="mt-5 grid min-w-0 gap-5 sm:mt-7 sm:gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
      <section className="min-w-0 rounded-[22px] border border-[#e2e5e2] bg-white p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-black">Recent additions</p><p className="mt-1 text-xs text-[#858c86]">Newest products in your catalog</p></div><Link href="/dashboard/phones" className="flex shrink-0 items-center gap-1 text-xs font-bold">View all <ArrowRight size={14}/></Link></div>
        <div className="mt-6 hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[550px] text-left"><thead><tr className="border-b border-[#eaebea] text-[10px] uppercase tracking-wider text-[#929993]"><th className="pb-3">Device</th><th className="pb-3">Price</th><th className="pb-3">Status</th></tr></thead><tbody>{stats.recent.map((phone) => <tr key={phone._id} className="border-b border-[#f0f1f0] text-xs"><td className="py-4"><strong>{phone.model}</strong><span className="block pt-1 text-[10px] text-[#8c938e]">{phone.brand}{phone.storage ? ` · ${phone.storage}` : ""}</span></td><td className="py-4 font-bold">{formatPrice(phone.price)}</td><td className="py-4"><StatusBadge phone={phone}/></td></tr>)}</tbody></table>
        </div>
        <div className="mt-4 grid gap-2 sm:hidden">
          {stats.recent.map((phone) => <article key={phone._id} className="rounded-2xl border border-[#eceeec] p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><strong className="block truncate text-xs">{phone.model}</strong><span className="mt-1 block truncate text-[10px] text-[#8c938e]">{phone.brand}{phone.storage ? ` · ${phone.storage}` : ""}</span></div><StatusBadge phone={phone}/></div><p className="mt-3 text-sm font-black">{formatPrice(phone.price)}</p></article>)}
          {!stats.recent.length && <p className="py-8 text-center text-xs text-[#858c87]">No products added yet.</p>}
        </div>
      </section>

      <section className="rounded-[18px] bg-[#0b0c0e] p-5 text-white sm:p-6"><p className="text-sm font-black">Stock overview</p><p className="mt-1 text-xs text-white/50">Inventory distribution</p><div className="mx-auto mt-8 grid size-40 place-items-center rounded-full border-[16px] border-[#7898ff] border-r-[#343a4c] sm:mt-10 sm:size-44 sm:border-[18px]"><div className="text-center"><p className="text-3xl font-black">{stats.units}</p><p className="text-[9px] uppercase tracking-widest text-white/50">Units</p></div></div><div className="mt-8 flex flex-wrap justify-between gap-3 text-[11px] sm:mt-9"><span><i className="mr-2 inline-block size-2 rounded-full bg-[#7898ff]"/>In stock</span><span><i className="mr-2 inline-block size-2 rounded-full bg-[#343a4c]"/>Low / out</span></div></section>
    </div>
  </div>;
}
