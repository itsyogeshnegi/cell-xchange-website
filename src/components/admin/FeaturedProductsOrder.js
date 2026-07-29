"use client";

import axios from "axios";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowDown, ArrowUp, Flame, GripVertical, LoaderCircle, Save } from "lucide-react";

export default function FeaturedProductsOrder({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [dropTargetId, setDropTargetId] = useState(null);

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= products.length) return;
    setProducts((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setChanged(true);
  };

  const startDrag = (event, productId) => {
    setDraggedId(productId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", productId);
  };

  const drop = (event, targetId) => {
    event.preventDefault();
    const sourceId = draggedId || event.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === targetId) {
      setDraggedId(null);
      setDropTargetId(null);
      return;
    }
    setProducts((current) => {
      const sourceIndex = current.findIndex((product) => product._id === sourceId);
      const targetIndex = current.findIndex((product) => product._id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setChanged(true);
    setDraggedId(null);
    setDropTargetId(null);
  };

  const save = async () => {
    setSaving(true);
    try {
      await axios.put("/api/phones/featured-order", { ids: products.map((product) => product._id) });
      setChanged(false);
      toast.success("Hot Picks priority saved");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save Hot Picks priority");
    } finally {
      setSaving(false);
    }
  };

  return <section className="mt-6 rounded-[22px] border border-[#e1e4e1] bg-white p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff1e8] text-[#a64e1e]"><Flame size={18}/></span><div><h2 className="text-sm font-black">Hot Picks priority</h2><p className="mt-1 text-xs leading-5 text-[#7a817c]">Priority 1 appears first. Drag the grip to reorder products, or use the arrow buttons.</p></div></div>
      <button type="button" onClick={save} disabled={!changed || saving} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#173f2c] px-5 py-3 text-xs font-bold text-white disabled:opacity-40">{saving ? <LoaderCircle size={15} className="animate-spin"/> : <Save size={15}/>}Save order</button>
    </div>
    <div className="mt-6 grid gap-3">
      {products.map((product, index) => <div
        key={product._id}
        onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }}
        onDragEnter={() => { if (draggedId && draggedId !== product._id) setDropTargetId(product._id); }}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDropTargetId((current) => current === product._id ? null : current); }}
        onDrop={(event) => drop(event, product._id)}
        className={`grid grid-cols-[36px_64px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border bg-[#f8f9f7] p-3 transition ${draggedId === product._id ? "border-[#9ba69e] opacity-45" : dropTargetId === product._id ? "border-[#173f2c] ring-2 ring-[#173f2c]/15" : "border-[#e4e7e4]"}`}
      >
        <button type="button" draggable onDragStart={(event) => startDrag(event, product._id)} onDragEnd={() => { setDraggedId(null); setDropTargetId(null); }} aria-label={`Drag ${product.model} to change priority`} className="grid size-9 cursor-grab place-items-center rounded-xl text-[#788078] hover:bg-white active:cursor-grabbing"><GripVertical size={18}/></button>
        <div className="relative aspect-square overflow-hidden rounded-xl bg-[#eceeeb]">{product.images?.[0]?.url ? <Image src={product.images[0].url} fill sizes="64px" className="object-cover" alt=""/> : null}</div>
        <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-[#7a817c]">Priority {index + 1}</p><p className="mt-1 truncate text-xs font-black">{product.model}</p><p className="mt-1 truncate text-[10px] text-[#7a817c]">{product.brand}</p></div>
        <div className="flex gap-1"><button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${product.model} up`} className="grid size-9 place-items-center rounded-full border border-[#d9ddda] bg-white disabled:opacity-30"><ArrowUp size={15}/></button><button type="button" onClick={() => move(index, 1)} disabled={index === products.length - 1} aria-label={`Move ${product.model} down`} className="grid size-9 place-items-center rounded-full border border-[#d9ddda] bg-white disabled:opacity-30"><ArrowDown size={15}/></button></div>
      </div>)}
      {!products.length && <div className="rounded-2xl border border-dashed border-[#d9ddda] px-5 py-10 text-center text-xs text-[#7a817c]">Enable “Feature on home page” on products to manage their order here.</div>}
    </div>
  </section>;
}
