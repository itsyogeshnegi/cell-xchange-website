"use client";
/* eslint-disable react-hooks/incompatible-library -- React Hook Form intentionally exposes non-memoizable form methods. */

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ArrowLeft, ImagePlus, LoaderCircle } from "lucide-react";
import { slugify } from "@/utils/format";

const brandsByCategory = {
  Phone: ["Apple", "Samsung", "Google", "OnePlus", "Nothing", "Xiaomi", "Redmi", "Realme", "Motorola", "Oppo", "Vivo", "Nokia", "Honor", "Sony", "Huawei", "Infinix", "Tecno"],
  Laptop: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "MSI", "Microsoft", "Samsung", "LG", "Huawei", "Razer"],
  Smartwatch: ["Apple", "Samsung", "Google", "Garmin", "Amazfit", "Fitbit", "Huawei", "OnePlus", "Xiaomi", "Noise", "boAt", "Fossil"],
};

const fields = [
  ["price", "Price (₹)", "119900", "decimal"], ["discount", "Discount (%)", "0", "decimal"],
  ["color", "Colour", "Black"], ["storage", "Storage", "256 GB"], ["ram", "RAM", "8 GB"],
  ["battery", "Battery", "Battery capacity or runtime"], ["display", "Display", "Display size and type"],
  ["processor", "Processor", "Processor or chipset"], ["camera", "Camera", "Camera details"],
  ["imei", "IMEI / serial number (optional)", "Optional"], ["stock", "Stock quantity", "8", "numeric"],
];

const formatBytes = (bytes) => bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
const canvasBlob = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));

async function optimizeImage(file) {
  if (file.size < 700 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d", { alpha: true }).drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    let quality = .92;
    let blob = await canvasBlob(canvas, "image/webp", quality);
    while (blob && blob.size > 900 * 1024 && quality > .82) { quality -= .04; blob = await canvasBlob(canvas, "image/webp", quality); }
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp", lastModified: Date.now() });
  } catch { return file; }
}

export default function PhoneForm({ phone }) {
  const router = useRouter();
  const [previews, setPreviews] = useState((phone?.images || []).map((image) => image.url));
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [compressing, setCompressing] = useState(false);
  const defaults = { category: "Phone", condition: "New", discount: 0, stock: 0, featured: false, latest: true, visible: true, ...phone };
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({ defaultValues: defaults });
  const model = watch("model");
  const slug = watch("slug");
  const category = watch("category") || "Phone";
  const categoryBrands = brandsByCategory[category] || brandsByCategory.Phone;
  const availableBrands = phone?.brand && !categoryBrands.includes(phone.brand) ? [phone.brand, ...categoryBrands] : categoryBrands;

  useEffect(() => { if (!phone && model) setValue("slug", slugify(model)); }, [model, phone, setValue]);

  const selectImages = async (event) => {
    const files = [...event.target.files];
    if (files.length < 2) { toast.error("Please select at least 2 product images"); event.target.value = ""; return; }
    if (files.length > 8) { toast.error("You can upload up to 8 images"); event.target.value = ""; return; }
    setCompressing(true);
    const optimized = await Promise.all(files.map(optimizeImage));
    setSelectedFiles(optimized);
    setPreviews(optimized.map((file) => URL.createObjectURL(file)));
    setCompressing(false);
    const before = files.reduce((sum, file) => sum + file.size, 0); const after = optimized.reduce((sum, file) => sum + file.size, 0);
    if (after < before) toast.success(`Images optimized: ${formatBytes(before)} → ${formatBytes(after)}`);
  };

  const submit = async (data) => {
    if (!phone && selectedFiles.length < 2) return toast.error("Upload at least 2 product images");
    if (selectedFiles.length === 1) return toast.error("Select at least 2 images when replacing photos");
    try {
      const body = new FormData();
      Object.entries(data).forEach(([key, value]) => body.append(key, typeof value === "boolean" ? String(value) : value ?? ""));
      selectedFiles.forEach((file) => body.append("images", file));
      if (phone) body.append("existingImages", JSON.stringify(phone.images || []));
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      phone ? await axios.put(`/api/phones/${phone._id}`, body, config) : await axios.post("/api/phones", body, config);
      toast.success(phone ? "Product updated" : "Product created"); router.push("/dashboard/phones"); router.refresh();
    } catch (error) { toast.error(error.response?.data?.message || "Could not save product"); }
  };

  return <form onSubmit={handleSubmit(submit)}>
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><Link href="/dashboard/phones" className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-[#6f7771]"><ArrowLeft size={14}/>Back to inventory</Link><h1 className="display text-4xl font-black">{phone ? "Edit product" : "Add new product"}</h1><p className="mt-2 text-sm text-[#747c76]">Create or update a phone, laptop, or smartwatch listing.</p></div><button disabled={isSubmitting || compressing} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#173f2c] px-6 py-3.5 text-xs font-bold text-white disabled:opacity-60">{(isSubmitting || compressing) && <LoaderCircle className="animate-spin" size={15}/>} {compressing ? "Optimizing images" : phone ? "Save changes" : "Publish product"}</button></div>
    <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
      <section className="rounded-[22px] border border-[#e1e4e1] bg-white p-5 sm:p-7"><h2 className="text-sm font-black">Product information</h2><div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label><span className="mb-2 block text-[11px] font-bold text-[#626b64]">Product type</span><select className="input" {...register("category", { required: true })}><option>Phone</option><option>Laptop</option><option>Smartwatch</option></select></label>
        <label><span className="mb-2 block text-[11px] font-bold text-[#626b64]">Brand</span><select className="input" {...register("brand", { required: true })}><option value="" disabled>Select a brand</option>{availableBrands.map((brand) => <option key={brand}>{brand}</option>)}</select></label>
        <label><span className="mb-2 block text-[11px] font-bold text-[#626b64]">Model</span><input placeholder="Model name" className="input" {...register("model", { required: true })}/></label>
        <label><span className="mb-2 block text-[11px] font-bold text-[#626b64]">Slug</span><input type="hidden" {...register("slug")}/><input value={slug || ""} disabled aria-label="Auto-generated slug" className="input cursor-not-allowed bg-[#f1f2f0] text-[#858c87]"/></label>
        {fields.map(([name, label, placeholder, inputMode]) => <label key={name} className={name === "imei" ? "sm:col-span-2" : ""}><span className="mb-2 block text-[11px] font-bold text-[#626b64]">{label}</span><input inputMode={inputMode} pattern={inputMode === "numeric" ? "[0-9]*" : inputMode === "decimal" ? "[0-9]+([.][0-9]+)?" : undefined} placeholder={placeholder} className="input" {...register(name, { required: !["imei", "discount"].includes(name) })}/>{errors[name] && <span className="mt-1 block text-[10px] text-red-600">This field is required</span>}</label>)}
      </div><label className="mt-5 block"><span className="mb-2 block text-[11px] font-bold text-[#626b64]">Description <span className="font-normal text-[#929993]">(optional)</span></span><textarea rows="5" className="input resize-none" placeholder="Describe the product, its strengths, and condition…" {...register("description")}/></label></section>
      <div className="grid content-start gap-6">
        <section className="rounded-[22px] border border-[#e1e4e1] bg-white p-5"><h2 className="text-sm font-black">Product images</h2><p className="mt-1 text-[11px] text-[#858c87]">Upload 2–8 images. Large files are automatically optimized to high-quality WebP.</p><label className="mt-5 flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-[#cbd1cc] bg-[#f8f9f7] px-5 py-8 text-center hover:bg-[#f2f5f1]"><ImagePlus size={23}/><span className="mt-3 text-xs font-bold">Choose 2–8 images</span><span className="mt-1 text-[10px] text-[#8b928c]">JPG, PNG, WebP or AVIF · 8MB max each</span><input name="images" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={selectImages}/></label>{selectedFiles.length > 0 && <p className="mt-3 text-[10px] font-bold text-[#66706a]">{selectedFiles.length} optimized images · {formatBytes(selectedFiles.reduce((sum, file) => sum + file.size, 0))}</p>}{previews.length > 0 && <div className="mt-4 grid grid-cols-3 gap-2">{previews.map((src, index) => <div key={`${src}-${index}`} className="relative aspect-square overflow-hidden rounded-xl bg-[#f1f2f0]"><Image src={src} fill alt={`Preview ${index + 1}`} className="object-cover" sizes="100px"/></div>)}</div>}</section>
        <section className="rounded-[22px] border border-[#e1e4e1] bg-white p-5"><h2 className="text-sm font-black">Listing options</h2><label className="mt-5 block text-[11px] font-bold">Condition<select className="input mt-2" {...register("condition")}><option>New</option><option>Excellent</option><option>Good</option><option>Fair</option></select></label><div className="mt-5 grid gap-4">{[["visible", "Show on website"], ["featured", "Feature on home page"], ["latest", "Mark as latest stock"]].map(([name, label]) => <label key={name} className="flex items-center justify-between text-xs font-bold"><span>{label}</span><input type="checkbox" className="h-4 w-4 accent-[#173f2c]" {...register(name)}/></label>)}</div></section>
      </div>
    </div>
  </form>;
}
