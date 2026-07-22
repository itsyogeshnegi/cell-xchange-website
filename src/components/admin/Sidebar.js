"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Boxes, LayoutDashboard, LogOut, Settings, ShoppingBag, Tags } from "lucide-react";
import axios from "axios";
import Logo from "@/components/ui/Logo";

const links=[["/dashboard",LayoutDashboard,"Overview"],["/dashboard/phones",Boxes,"Phones"],["/dashboard/brands",Tags,"Brands"],["/dashboard/orders",ShoppingBag,"Orders"],["/dashboard/settings",Settings,"Settings"]];
export default function Sidebar(){const path=usePathname();const router=useRouter();const logout=async()=>{await axios.post("/api/auth/logout");router.push("/login");router.refresh()};return <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#e6e8e6] bg-white p-5 lg:flex"><div className="px-2 py-3"><Logo/></div><nav className="mt-8 grid gap-1">{links.map(([href,Icon,label])=><Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-bold ${path===href?"bg-[#173f2c] text-white":"text-[#69716c] hover:bg-[#f3f5f2] hover:text-black"}`}><Icon size={17}/>{label}{label==="Orders"&&<span className="ml-auto rounded-full bg-[#eff1ef] px-2 py-0.5 text-[9px] text-[#747b75]">Soon</span>}</Link>)}</nav><div className="mt-auto rounded-2xl bg-[#f2f5f1] p-4"><BarChart3 size={20} className="text-[#5e806c]"/><p className="mt-3 text-xs font-bold">Inventory health</p><p className="mt-1 text-[11px] text-[#7a827c]">Keep your stock fresh and accurate.</p></div><button onClick={logout} className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-bold text-[#69716c] hover:bg-[#fff0f0] hover:text-red-700"><LogOut size={17}/>Sign out</button></aside>}
