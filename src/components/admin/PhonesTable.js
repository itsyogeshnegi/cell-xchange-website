"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { Edit3, FileSpreadsheet, LoaderCircle, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useDeferredValue, useEffect, useRef, useState, useTransition } from "react";
import ExportModal from "@/components/admin/ExportModal";
import { formatPrice } from "@/utils/format";

const PAGE_SIZE = 12;

const statusStyles = {
  Available: "bg-[#edf7ef] text-[#246441]",
  Sold: "bg-[#fff0eb] text-[#a34b32]",
  Block: "bg-[#f1f1f1] text-[#555b57]",
};

export default function PhonesTable({ initialPage }) {
  const [items, setItems] = useState(initialPage?.items || []);
  const [total, setTotal] = useState(initialPage?.total || 0);
  const [pages, setPages] = useState(initialPage?.pages || 1);
  const [loadedPage, setLoadedPage] = useState(initialPage?.page || 1);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [deleting, setDeleting] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isPending, startTransition] = useTransition();

  const deferredQuery = useDeferredValue(query.trim());
  const initialSignature = useRef(":All");
  const loadMoreRef = useRef(null);
  const loadMoreAbortRef = useRef(null);
  const filterLoadingRef = useRef(false);

  // Filter & Search handler: resets list to page 1
  useEffect(() => {
    const signature = `${deferredQuery}:${status}`;
    if (initialSignature.current === signature) {
      initialSignature.current = null;
      return;
    }

    filterLoadingRef.current = true;
    loadMoreAbortRef.current?.abort();
    setLoadingMore(false);
    setLoading(true);

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: String(PAGE_SIZE),
        admin: "1",
      });
      if (deferredQuery) params.set("q", deferredQuery);
      if (status !== "All") params.set("status", status);

      try {
        const response = await fetch(`/api/phones?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load inventory");
        const result = await response.json();
        startTransition(() => {
          setItems(result.data.items || []);
          setTotal(result.data.total || 0);
          setPages(result.data.pages || 1);
          setLoadedPage(1);
        });
      } catch (error) {
        if (error.name !== "AbortError") toast.error("Could not refresh inventory");
      } finally {
        if (!controller.signal.aborted) {
          filterLoadingRef.current = false;
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [deferredQuery, status]);

  // Infinite scroll loader: fetches next page chunk and appends linewise
  const loadMore = useCallback(async () => {
    if (filterLoadingRef.current || loading || loadingMore || loadedPage >= pages) return;

    setLoadingMore(true);
    const controller = new AbortController();
    loadMoreAbortRef.current = controller;
    const nextPage = loadedPage + 1;

    const params = new URLSearchParams({
      page: String(nextPage),
      limit: String(PAGE_SIZE),
      admin: "1",
    });
    if (deferredQuery) params.set("q", deferredQuery);
    if (status !== "All") params.set("status", status);

    try {
      const response = await fetch(`/api/phones?${params}`, { signal: controller.signal });
      if (!response.ok) throw new Error("Could not load more products");
      const result = await response.json();

      startTransition(() => {
        setItems((current) => {
          const existingIds = new Set(current.map((item) => item._id));
          const newItems = (result.data.items || []).filter((item) => !existingIds.has(item._id));
          return [...current, ...newItems];
        });
        setTotal(result.data.total || 0);
        setPages(result.data.pages || 1);
        setLoadedPage(nextPage);
      });
    } catch (error) {
      if (error.name !== "AbortError") toast.error("Could not load more products");
    } finally {
      if (loadMoreAbortRef.current === controller) loadMoreAbortRef.current = null;
      if (!controller.signal.aborted) setLoadingMore(false);
    }
  }, [deferredQuery, status, loadedPage, loading, loadingMore, pages]);

  // Observer to trigger loadMore when user scrolls near the bottom of the table
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || loadedPage >= pages) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "400px 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore, loadedPage, pages]);

  useEffect(() => () => loadMoreAbortRef.current?.abort(), []);

  const changeStatus = useCallback((event) => {
    startTransition(() => {
      setStatus(event.target.value);
    });
  }, []);

  const toggleVisibility = useCallback(async (product) => {
    const visible = product.visible === false;
    try {
      const { data } = await axios.patch(`/api/phones/${product._id}`, { visible });
      setItems((current) => current.map((item) => (item._id === product._id ? data.data : item)));
      toast.success(visible ? "Product is now visible" : "Product hidden from website");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not change visibility");
    }
  }, []);

  const remove = useCallback(async () => {
    if (!deleting) return;
    try {
      await axios.delete(`/api/phones/${deleting._id}`);
      setItems((current) => current.filter((item) => item._id !== deleting._id));
      setTotal((current) => Math.max(0, current - 1));
      toast.success("Product removed");
      setDeleting(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete product");
    }
  }, [deleting]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-[#718078]">All inventory</p>
          <h1 className="display mt-2 text-4xl font-black">Products</h1>
          <p className="mt-2 text-sm text-[#747c76]">Manage phones, laptops and smartwatches from one place.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsExportOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#cbd1cc] bg-white px-5 py-3 text-xs font-bold text-[#151915] hover:bg-[#f4f5f3]"
          >
            <FileSpreadsheet size={16} className="text-[#173f2c]" />
            Export Excel
          </button>
          <Link
            href="/dashboard/phones/create"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#173f2c] px-5 py-3 text-xs font-bold text-white"
          >
            <Plus size={15} />
            Add product
          </Link>
        </div>
      </div>

      <div
        className={`mt-8 overflow-hidden rounded-[22px] border border-[#e1e4e1] bg-white transition-opacity ${isPending || loading ? "opacity-60" : "opacity-100"
          }`}
      >
        <div className="flex flex-col gap-3 border-b border-[#e8eae8] p-4 sm:flex-row">
          <label className="flex flex-1 items-center gap-2 rounded-xl bg-[#f4f5f3] px-3">
            <Search size={15} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search all inventory"
              className="h-11 flex-1 bg-transparent text-xs outline-none"
            />
          </label>

        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="bg-[#fafbfa] text-[10px] uppercase tracking-wider text-[#8b938d]">
                <th className="px-5 py-3">Product</th>
                <th>Type</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th className="pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((product) => {
                const productStatus = product.status || (product.stock > 0 ? "Available" : "Sold");
                return (
                  <tr key={product._id} className="border-t border-[#eceeec] text-xs">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-[#f2f3f1]">
                          <Image
                            src={product.images?.[0]?.url || "/hero-black"}
                            fill
                            sizes="48px"
                            className="object-cover"
                            alt=""
                          />
                        </div>
                        <div>
                          <strong>{product.model}</strong>
                          <span className="mt-1 block text-[10px] text-[#8b928d]">
                            {product.brand}
                            {product.storage ? ` · ${product.storage}` : ""}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="rounded-full bg-[#f0f2f0] px-2.5 py-1 text-[9px] font-bold">
                        {product.category || "Phone"}
                      </span>
                    </td>
                    <td className="font-bold">{formatPrice(product.price)}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${statusStyles[productStatus] || statusStyles.Block
                          }`}
                      >
                        {productStatus}
                      </span>
                    </td>
                    <td className="pr-5">
                      <div className="flex items-center justify-end gap-2">
                        <label className="flex items-center gap-2 text-[9px] font-bold text-[#6f7771]">
                          <span>Website</span>
                          <input
                            type="checkbox"
                            checked={product.visible !== false}
                            onChange={() => toggleVisibility(product)}
                            className="h-4 w-4 accent-[#173f2c]"
                            aria-label={`${product.visible !== false ? "Hide" : "Show"} ${product.model} on website`}
                          />
                        </label>
                        <Link
                          href={`/dashboard/phones/edit/${product._id}`}
                          aria-label={`Edit ${product.model}`}
                          className="inline-grid h-9 w-9 place-items-center rounded-full hover:bg-[#f1f3f1]"
                        >
                          <Edit3 size={15} />
                        </Link>
                        <button
                          aria-label={`Delete ${product.model}`}
                          onClick={() => setDeleting(product)}
                          className="inline-grid h-9 w-9 place-items-center rounded-full text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Skeleton placeholder rows while loading next chunk */}
              {loadingMore &&
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={`loading-skeleton-${idx}`} className="border-t border-[#eceeec] text-xs animate-pulse">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-[#e9ece8]" />
                        <div className="space-y-2">
                          <div className="h-3 w-32 rounded bg-[#e9ece8]" />
                          <div className="h-2 w-20 rounded bg-[#e9ece8]" />
                        </div>
                      </div>
                    </td>
                    <td><div className="h-5 w-14 rounded-full bg-[#e9ece8]" /></td>
                    <td><div className="h-4 w-16 rounded bg-[#e9ece8]" /></td>
                    <td><div className="h-4 w-8 rounded bg-[#e9ece8]" /></td>
                    <td><div className="h-5 w-16 rounded-full bg-[#e9ece8]" /></td>
                    <td className="pr-5 text-right"><div className="inline-block h-6 w-24 rounded bg-[#e9ece8]" /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!loading && !items.length && (
          <div className="py-16 text-center text-sm text-[#7b837d]">No matching inventory found.</div>
        )}
      </div>

      {/* Sentinel element observed by IntersectionObserver to trigger API calls seamlessly */}
      {loadedPage < pages && (
        <div ref={loadMoreRef} aria-hidden="true" className="h-4 w-full" />
      )}

      {/* Status overview replacing pagination bar */}
      <div className="mt-4 flex flex-col items-center justify-between gap-3 text-xs text-[#737b75] sm:flex-row">
        <p>
          Showing <strong className="text-[#151915]">{items.length}</strong> of{" "}
          <strong className="text-[#151915]">{total}</strong> total products
        </p>

        <div>
          {loadingMore && (
            <span className="inline-flex items-center gap-2 font-semibold text-[#173f2c]">
              <LoaderCircle size={14} className="animate-spin" />
              Loading more products...
            </span>
          )}
          {!loadingMore && items.length > 0 && loadedPage >= pages && (
            <span className="text-[#8b928d]">All {total} products loaded</span>
          )}
        </div>
      </div>

      {deleting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-title" className="w-full max-w-sm rounded-[22px] bg-white p-6 shadow-2xl">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={19} />
            </div>
            <h2 id="delete-title" className="mt-5 text-xl font-black">
              Delete {deleting.model}?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6e766f]">
              This removes the product and its Cloudinary images. This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="flex-1 rounded-full border border-[#dfe2df] py-3 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={remove}
                className="flex-1 rounded-full bg-red-600 py-3 text-xs font-bold text-white"
              >
                Delete product
              </button>
            </div>
          </div>
        </div>
      )}

      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </>
  );
}
