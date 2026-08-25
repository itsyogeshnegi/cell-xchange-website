"use client";

import { useCallback, useDeferredValue, useEffect, useRef, useState, useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import PhoneCard from "@/components/phones/PhoneCard";
import { PhoneGridSkeleton } from "@/components/ui/Skeletons";
import { deviceFilterOptions } from "@/lib/device-filters";

export default function Catalog({ initialPage, initialDevice = "All" }) {
  const [items, setItems] = useState(initialPage.items);
  const [total, setTotal] = useState(initialPage.total);
  const [pages, setPages] = useState(initialPage.pages);
  const [query, setQuery] = useState("");
  const [device, setDevice] = useState(initialDevice);
  const [loadedPage, setLoadedPage] = useState(initialPage.page);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query.trim());
  const initialSignature = useRef(`:${initialDevice}`);
  const loadMoreRef = useRef(null);
  const loadMoreAbortRef = useRef(null);
  const filterLoadingRef = useRef(false);

  useEffect(() => {
    const signature = `${deferredQuery}:${device}`;
    if (initialSignature.current === signature) { initialSignature.current = null; return; }
    filterLoadingRef.current = true;
    loadMoreAbortRef.current?.abort();
    setLoadingMore(false);
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const params = new URLSearchParams({ page: "1", limit: "12" });
      if (deferredQuery) params.set("q", deferredQuery);
      if (device !== "All") params.set("device", device);
      try {
        const response = await fetch(`/api/phones?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load phones");
        const result = await response.json();
        startTransition(() => {
          setItems(result.data.items);
          setTotal(result.data.total);
          setPages(result.data.pages);
          setLoadedPage(1);
        });
      } catch (error) {
        if (error.name !== "AbortError") console.error(error);
      } finally {
        if (!controller.signal.aborted) {
          filterLoadingRef.current = false;
          setLoading(false);
        }
      }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [deferredQuery, device]);

  const loadMore = useCallback(async () => {
    if (filterLoadingRef.current || loading || loadingMore || loadedPage >= pages) return;
    setLoadingMore(true);
    const controller = new AbortController();
    loadMoreAbortRef.current = controller;
    const nextPage = loadedPage + 1;
    const params = new URLSearchParams({ page: String(nextPage), limit: "12" });
    if (deferredQuery) params.set("q", deferredQuery);
    if (device !== "All") params.set("device", device);
    try {
      const response = await fetch(`/api/phones?${params}`, { signal: controller.signal });
      if (!response.ok) throw new Error("Could not load more phones");
      const result = await response.json();
      startTransition(() => {
        setItems((current) => {
          const existingIds = new Set(current.map((item) => item._id));
          return [...current, ...result.data.items.filter((item) => !existingIds.has(item._id))];
        });
        setTotal(result.data.total);
        setPages(result.data.pages);
        setLoadedPage(nextPage);
      });
    } catch (error) {
      if (error.name !== "AbortError") console.error(error);
    } finally {
      if (loadMoreAbortRef.current === controller) loadMoreAbortRef.current = null;
      if (!controller.signal.aborted) setLoadingMore(false);
    }
  }, [deferredQuery, device, loadedPage, loading, loadingMore, pages]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || loadedPage >= pages) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore();
    }, { rootMargin: "500px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore, loadedPage, pages]);

  useEffect(() => () => loadMoreAbortRef.current?.abort(), []);

  const updateFilter = useCallback((setter, value) => startTransition(() => setter(value)), []);
  const updateQuery = useCallback((event) => setQuery(event.target.value), []);
  const clear = useCallback(() => startTransition(() => { setQuery(""); setDevice("All"); }), []);
  const pending = loading || loadingMore || isPending;

  return <>
    <div className="mb-10 grid gap-3 rounded-[20px] border border-[#e5e8e5] bg-[#fafbfa] p-3 md:grid-cols-[1fr_auto]">
      <label className="flex items-center gap-2 rounded-xl bg-white px-4 ring-1 ring-[#e5e8e5]"><Search size={16} className="text-[#737c76]"/><input value={query} onChange={updateQuery} placeholder="Search model or brand" className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"/></label>
      <label className="flex items-center gap-2 rounded-xl bg-white px-3 ring-1 ring-[#e5e8e5]"><SlidersHorizontal size={15}/><select aria-label="Filter by device family" value={device} onChange={(event) => updateFilter(setDevice, event.target.value)} className="h-12 bg-transparent text-sm font-semibold outline-none">{deviceFilterOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</select></label>
    </div>
    <div className="mb-5 flex items-center justify-between" aria-live="polite"><p className={`text-sm text-[#69716c] transition-opacity ${pending ? "opacity-50" : "opacity-100"}`}><strong className="text-[#151915]">{total}</strong> products available</p>{(query || device !== "All") && <button onClick={clear} className="flex items-center gap-1 text-xs font-bold"><X size={14}/> Clear filters</button>}</div>
    {loading ? <PhoneGridSkeleton count={6}/> : items.length ? <div className={`grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${isPending && !loadingMore ? "opacity-60" : "opacity-100"}`}>{items.map((phone) => <PhoneCard key={phone._id} phone={phone}/>)}</div> : <div className="rounded-[24px] bg-[#f5f6f4] py-24 text-center"><Search className="mx-auto mb-4 text-[#94a099]"/><h3 className="text-xl font-bold">No products found</h3><p className="mt-2 text-sm text-[#6e766f]">Try a different search or clear your filters.</p></div>}
    {loadingMore && <div className="mt-5"><PhoneGridSkeleton count={3}/></div>}
    {loadedPage < pages && <div ref={loadMoreRef} aria-hidden="true" className="h-px"/>}
    {!loading && !loadingMore && items.length > 0 && loadedPage >= pages && <p className="mt-10 text-center text-xs text-[#7a817c]">All {total} products loaded</p>}
  </>;
}
