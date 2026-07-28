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

export default async function Dashboard() {
  const stats = await getDashboardStats();
  return <div className="mx-auto max-w-7xl">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow text-[#718078]">Inventory overview</p><h1 className="display mt-2 text-4xl font-black">{getGreeting()}, Owner.</h1><p className="mt-2 text-sm text-[#727a74]">Here’s what’s happening with your inventory.</p></div><Link href="/dashboard/phones/create" className="rounded-full bg-[#173f2c] px-5 py-3 text-center text-xs font-bold text-white">+ Add new phone</Link></div>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total products" value={stats.total} change="Across all inventory" icon={Boxes} tone="blue"/><StatCard label="Available stock" value={stats.available} change="Ready to sell" icon={PackageCheck}/><StatCard label="Out of stock" value={stats.outOfStock} change="Needs attention" icon={CircleX} tone="peach"/><StatCard label="Total cost" value={formatPrice(stats.totalCost)} change="Current inventory value" icon={IndianRupee} tone="dark"/></div>
    <div className="mt-7"><section className="rounded-[22px] border border-[#e2e5e2] bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-black">Recent additions</p><p className="mt-1 text-xs text-[#858c86]">Newest phones in your catalog</p></div><Link href="/dashboard/phones" className="flex items-center gap-1 text-xs font-bold">View all <ArrowRight size={14}/></Link></div><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[550px] text-left"><thead><tr className="border-b border-[#eaebea] text-[10px] uppercase tracking-wider text-[#929993]"><th className="pb-3">Device</th><th className="pb-3">Price</th><th className="pb-3">Stock</th><th className="pb-3">Status</th></tr></thead><tbody>{stats.recent.map((phone) => <tr key={phone._id} className="border-b border-[#f0f1f0] text-xs"><td className="py-4"><strong>{phone.model}</strong><span className="block pt-1 text-[10px] text-[#8c938e]">{phone.brand} · {phone.storage}</span></td><td className="py-4 font-bold">{formatPrice(phone.price)}</td><td className="py-4">{phone.stock}</td><td className="py-4"><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${phone.stock ? "bg-[#edf7ef] text-[#21603e]" : "bg-[#fff0eb] text-[#a34b32]"}`}>{phone.stock ? "Available" : "Sold out"}</span></td></tr>)}</tbody></table></div></section>
    </div>
  </div>;
}
