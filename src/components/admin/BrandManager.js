"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Edit3, LoaderCircle, Plus, Save, Tags, Trash2, X } from "lucide-react";
import { productCategories } from "@/lib/brands";

const emptyForm = { name: "", categories: [] };

export default function BrandManager({ initialBrands, brandCounts }) {
  const router = useRouter();
  const [brands, setBrands] = useState(initialBrands);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggleCategory = (category) => setForm((current) => ({
    ...current,
    categories: current.categories.includes(category)
      ? current.categories.filter((item) => item !== category)
      : [...current.categories, category],
  }));
  const reset = () => { setForm(emptyForm); setEditingId(null); };
  const edit = (brand) => {
    setEditingId(brand._id);
    setForm({ name: brand.name, categories: [...brand.categories] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.categories.length) return toast.error("Choose at least one product type");
    setSaving(true);
    try {
      const { data } = editingId
        ? await axios.patch(`/api/brands/${editingId}`, form)
        : await axios.post("/api/brands", form);
      setBrands((current) => editingId
        ? current.map((brand) => brand._id === editingId ? data.data : brand).sort((a, b) => a.name.localeCompare(b.name))
        : [...current, data.data].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(editingId ? "Brand updated" : "Brand added");
      reset();
      router.refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save brand");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/brands/${deleteTarget._id}`);
      setBrands((current) => current.filter((brand) => brand._id !== deleteTarget._id));
      toast.success("Brand removed from future selections");
      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete brand");
    } finally {
      setDeleting(false);
    }
  };

  return <>
    <form onSubmit={submit} className="mt-8 rounded-[22px] border border-[#e1e4e1] bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="text-sm font-black">{editingId ? "Edit brand" : "Add brand"}</h2><p className="mt-1 text-xs text-[#7b837d]">Choose every product type where this brand should appear.</p></div>
        {editingId && <button type="button" onClick={reset} aria-label="Cancel editing" className="grid size-9 place-items-center rounded-full bg-[#f2f4f2]"><X size={16}/></button>}
      </div>
      <label className="mt-5 block text-[11px] font-bold text-[#626b64]">Brand name *<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required maxLength={80} className="input mt-2"/></label>
      <fieldset className="mt-5"><legend className="text-[11px] font-bold text-[#626b64]">Product types *</legend><div className="mt-3 flex flex-wrap gap-2">{productCategories.map((category) => <label key={category} className={`cursor-pointer rounded-full border px-4 py-2 text-[10px] font-bold transition ${form.categories.includes(category) ? "border-[#173f2c] bg-[#173f2c] text-white" : "border-[#dfe3df] bg-white text-[#626b64]"}`}><input type="checkbox" checked={form.categories.includes(category)} onChange={() => toggleCategory(category)} className="sr-only"/>{category}</label>)}</div></fieldset>
      <button disabled={saving} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#173f2c] px-6 py-3.5 text-xs font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle size={15} className="animate-spin"/> : editingId ? <Save size={15}/> : <Plus size={15}/>} {saving ? "Saving brand" : editingId ? "Save brand" : "Add brand"}</button>
    </form>

    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {brands.map((brand) => <article key={brand._id} className="rounded-[20px] border border-[#e1e4e1] bg-white p-6">
        <div className="flex items-start justify-between gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#f1f4f1] text-[#5d6e62]"><Tags size={16}/></span><div className="flex gap-1"><button onClick={() => edit(brand)} aria-label={`Edit ${brand.name}`} className="grid size-9 place-items-center rounded-full hover:bg-[#f1f3f1]"><Edit3 size={15}/></button><button onClick={() => setDeleteTarget(brand)} aria-label={`Delete ${brand.name}`} className="grid size-9 place-items-center rounded-full text-red-600 hover:bg-red-50"><Trash2 size={15}/></button></div></div>
        <p className="mt-4 text-lg font-black">{brand.name}</p>
        <p className="mt-2 text-xs text-[#7b837d]">{brandCounts[brand.name] || 0} active listing{(brandCounts[brand.name] || 0) === 1 ? "" : "s"}</p>
        <p className="mt-3 text-[10px] leading-5 text-[#939a95]">{brand.categories.join(" · ")}</p>
      </article>)}
    </div>

    {deleteTarget && <div className="fixed inset-0 z-[150] grid place-items-center bg-black/60 p-4" role="alertdialog" aria-modal="true" aria-labelledby="delete-brand-title">
      <div className="w-full max-w-sm rounded-[22px] bg-white p-6 shadow-2xl"><div className="grid size-11 place-items-center rounded-full bg-red-50 text-red-600"><Trash2 size={19}/></div><h2 id="delete-brand-title" className="mt-5 text-xl font-black">Delete {deleteTarget.name}?</h2><p className="mt-2 text-sm leading-6 text-[#6e766f]">It will disappear from new product selections. Existing products using this brand will remain unchanged.</p><div className="mt-6 flex gap-3"><button disabled={deleting} onClick={() => setDeleteTarget(null)} className="flex-1 rounded-full border border-[#dfe2df] py-3 text-xs font-bold disabled:opacity-50">Cancel</button><button disabled={deleting} onClick={remove} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-600 py-3 text-xs font-bold text-white disabled:opacity-60">{deleting && <LoaderCircle size={14} className="animate-spin"/>}{deleting ? "Deleting" : "Delete"}</button></div></div>
    </div>}
  </>;
}
