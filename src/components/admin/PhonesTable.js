"use client";

import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { formatPrice } from "@/utils/format";

export default function PhonesTable({ initialPage, facets }) {
  const [items, setItems] = useState(initialPage.items);
  const [total, setTotal] = useState(initialPage.total);
  const [pages, setPages] = useState(initialPage.pages);
  const [page, setPage] = useState(initialPage.page);
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("All");
  const [deleting, setDeleting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query.trim());
  const initialSignature = useRef(":All:1");
  const brands = useMemo(() => ["All", ...facets.brands], [facets.brands]);

  useEffect(() => {
    const signature = `${deferredQuery}:${brand}:${page}`;
    if (initialSignature.current === signature) { initialSignature.current = null; return; }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (deferredQuery) params.set("q", deferredQuery);
      if (brand !== "All") params.set("brand", brand);
      try {
        const response = await fetch(`/api/phones?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load inventory");
        const result = await response.json();
        startTransition(() => { setItems(result.data.items); setTotal(result.data.total); setPages(result.data.pages); });
      } catch (error) { if (error.name !== "AbortError") toast.error("Could not refresh inventory"); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [deferredQuery, brand, page]);

  const closeDelete = useCallback(() => setDeleting(null), []);
  const changeBrand = useCallback((event) => startTransition(() => { setBrand(event.target.value); setPage(1); }), []);
  const remove = useCallback(async () => {
    if (!deleting) return;
    try {
      await axios.delete(`/api/phones/${deleting._id}`);
      setItems((current) => current.filter((item) => item._id !== deleting._id));
      setTotal((current) => Math.max(0, current - 1));
      toast.success("Phone removed");
      setDeleting(null);
    } catch (error) { toast.error(error.response?.data?.message || "Could not delete phone"); }
  }, [deleting]);

  return <>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow text-[#718078]">Inventory</p><h1 className="display mt-2 text-4xl font-black">Phones</h1><p className="mt-2 text-sm text-[#747c76]">Manage every device from one place.</p></div><Link href="/dashboard/phones/create" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#173f2c] px-5 py-3 text-xs font-bold text-white"><Plus size={15}/>Add phone</Link></div>
    <div className={`mt-8 overflow-hidden rounded-[22px] border border-[#e1e4e1] bg-white transition-opacity ${isPending || loading ? "opacity-60" : "opacity-100"}`}>
      <div className="flex flex-col gap-3 border-b border-[#e8eae8] p-4 sm:flex-row"><label className="flex flex-1 items-center gap-2 rounded-xl bg-[#f4f5f3] px-3"><Search size={15}/><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search inventory" className="h-11 flex-1 bg-transparent text-xs outline-none"/></label><select aria-label="Filter by brand" value={brand} onChange={changeBrand} className="rounded-xl border border-[#e3e5e3] bg-white px-4 text-xs font-bold">{brands.map((item) => <option key={item}>{item}</option>)}</select></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="bg-[#fafbfa] text-[10px] uppercase tracking-wider text-[#8b938d]"><th className="px-5 py-3">Phone</th><th>Price</th><th>Stock</th><th>Status</th><th className="text-right pr-5">Actions</th></tr></thead><tbody>{items.map((phone) => <tr key={phone._id} className="border-t border-[#eceeec] text-xs"><td className="px-5 py-3"><div className="flex items-center gap-3"><div className="relative h-12 w-12 overflow-hidden rounded-xl bg-[#f2f3f1]"><Image src={phone.images[0].url} fill sizes="48px" className="object-cover" alt=""/></div><div><strong>{phone.model}</strong><span className="mt-1 block text-[10px] text-[#8b928d]">{phone.brand} · {phone.storage}</span></div></div></td><td className="font-bold">{formatPrice(phone.price)}</td><td>{phone.stock}</td><td><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${phone.stock ? "bg-[#edf7ef] text-[#246441]" : "bg-[#fff0eb] text-[#a34b32]"}`}>{phone.stock ? "Available" : "Out of stock"}</span></td><td className="pr-5 text-right"><Link href={`/dashboard/phones/edit/${phone._id}`} aria-label={`Edit ${phone.model}`} className="mr-1 inline-grid h-9 w-9 place-items-center rounded-full hover:bg-[#f1f3f1]"><Edit3 size={15}/></Link><button aria-label={`Delete ${phone.model}`} onClick={() => setDeleting(phone)} className="inline-grid h-9 w-9 place-items-center rounded-full text-red-600 hover:bg-red-50"><Trash2 size={15}/></button></td></tr>)}</tbody></table></div>
      {!items.length && <div className="py-16 text-center text-sm text-[#7b837d]">No matching phones found.</div>}
    </div>
    <div className="mt-4 flex items-center justify-between"><p className="text-xs text-[#737b75]">{total} total listings</p>{pages > 1 && <div className="flex gap-2">{Array.from({ length: pages }, (_, index) => index + 1).map((item) => <button key={item} onClick={() => startTransition(() => setPage(item))} className={`h-9 w-9 rounded-full text-xs font-bold ${page === item ? "bg-[#173f2c] text-white" : "border border-[#dfe3df] bg-white"}`}>{item}</button>)}</div>}</div>
    {deleting && <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" aria-labelledby="delete-title" className="w-full max-w-sm rounded-[22px] bg-white p-6 shadow-2xl"><div className="grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-600"><Trash2 size={19}/></div><h2 id="delete-title" className="mt-5 text-xl font-black">Delete {deleting.model}?</h2><p className="mt-2 text-sm leading-6 text-[#6e766f]">This removes the listing and its Cloudinary images. This action cannot be undone.</p><div className="mt-6 flex gap-3"><button onClick={closeDelete} className="flex-1 rounded-full border border-[#dfe2df] py-3 text-xs font-bold">Cancel</button><button onClick={remove} className="flex-1 rounded-full bg-red-600 py-3 text-xs font-bold text-white">Delete phone</button></div></div></div>}
  </>;
}
