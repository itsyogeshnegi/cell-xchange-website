"use client";
/* eslint-disable react-hooks/incompatible-library -- React Hook Form intentionally exposes non-memoizable form methods. */

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ArrowLeft, ImagePlus, LoaderCircle, ScanLine } from "lucide-react";
import BarcodeScannerModal from "@/components/admin/BarcodeScannerModal";
import { slugify } from "@/utils/format";

const fields = [
  ["price", "Price (₹)", "119900", "decimal"],
  ["color", "Colour", "Black"], ["storage", "Storage", "256 GB"], ["ram", "RAM", "8 GB"],
  ["warrantyStatus", "Warranty status", "12 months manufacturer warranty"],
  ["battery", "Battery", "Battery capacity or runtime"], ["display", "Display", "Display size and type"],
  ["processor", "Processor", "Processor or chipset"], ["camera", "Camera", "Camera details"],
  ["accessories", "Accessories (comma-separated)", "Charger, cable, box"],
];

const formatBytes = (bytes) => bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
const canvasBlob = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));
const IMAGE_OPTIMIZATION = {
  minimumSize: 1.5 * 1024 * 1024,
  maxDimension: 3000,
  targetSize: 2.5 * 1024 * 1024,
  initialQuality: .95,
  minimumQuality: .9,
  qualityStep: .02,
};
const formatIndianNumber = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!digits) return "";
  const lastThree = digits.slice(-3);
  const leading = digits.slice(0, -3);
  return leading ? `${leading.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${lastThree}` : lastThree;
};

async function optimizeImage(file) {
  if (file.size < IMAGE_OPTIMIZATION.minimumSize) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, IMAGE_OPTIMIZATION.maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d", { alpha: true });
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    let quality = IMAGE_OPTIMIZATION.initialQuality;
    let blob = await canvasBlob(canvas, "image/webp", quality);
    while (blob && blob.size > IMAGE_OPTIMIZATION.targetSize && quality > IMAGE_OPTIMIZATION.minimumQuality) {
      quality = Math.max(IMAGE_OPTIMIZATION.minimumQuality, quality - IMAGE_OPTIMIZATION.qualityStep);
      blob = await canvasBlob(canvas, "image/webp", quality);
    }
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp", lastModified: Date.now() });
  } catch { return file; }
}

export default function PhoneForm({ phone, brandsByCategory = {} }) {
  const router = useRouter();
  const [previews, setPreviews] = useState((phone?.images || []).map((image) => image.url));
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [compressing, setCompressing] = useState(false);
  const [scannerField, setScannerField] = useState(null);
  const defaults = {
    category: "",
    brand: "",
    condition: "",
    status: "",
    warrantyStatus: "Not specified",
    featured: false,
    latest: true,
    visible: true,
    ...phone,
    status: phone?.status || (phone ? (phone.stock > 0 ? "Available" : "Sold") : ""),
    accessories: Array.isArray(phone?.accessories) ? phone.accessories.join(", ") : phone?.accessories || "",
  };
  const { control, register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({ defaultValues: defaults });
  const model = watch("model");
  const slug = watch("slug");
  const category = watch("category") || "";
  const selectedBrand = watch("brand");
  const categoryBrands = brandsByCategory[category] || [];
  const availableBrands = phone?.brand && !categoryBrands.includes(phone.brand) ? [phone.brand, ...categoryBrands] : categoryBrands;

  useEffect(() => { if (!phone && model) setValue("slug", slugify(model)); }, [model, phone, setValue]);

  const selectImages = async (event) => {
    const files = [...event.target.files];
    if (files.length > 3) { toast.error("You can upload up to 3 images"); event.target.value = ""; return; }
    setCompressing(true);
    const optimized = await Promise.all(files.map(optimizeImage));
    setSelectedFiles(optimized);
    setPreviews(optimized.map((file) => URL.createObjectURL(file)));
    setCompressing(false);
    const before = files.reduce((sum, file) => sum + file.size, 0); const after = optimized.reduce((sum, file) => sum + file.size, 0);
    if (after < before) toast.success(`Images optimized: ${formatBytes(before)} → ${formatBytes(after)}`);
  };

  const submit = async (data) => {
    if (!phone && selectedFiles.length < 1) return toast.error("Upload at least 1 product image");
    try {
      const body = new FormData();
      const normalizedData = { ...data, brand: data.brand === "__custom__" ? data.customBrand?.trim() : data.brand };
      delete normalizedData.customBrand;
      Object.entries(normalizedData).forEach(([key, value]) => body.append(key, typeof value === "boolean" ? String(value) : value ?? ""));
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
        <label><span className="mb-2 block text-[11px] font-bold text-[#626b64]">Product type *</span><select className="input" {...register("category", { required: "Product type is required", onChange: () => { setValue("brand", ""); setValue("customBrand", ""); } })}><option value="" disabled>Select product type</option><option>Phone</option><option>Laptop</option><option>Smartwatch</option><option>iPad &amp; Tabs</option><option>Accessories</option></select>{errors.category && <span className="mt-1 block text-[10px] text-red-600">{errors.category.message}</span>}</label>
        <label><span className="mb-2 block text-[11px] font-bold text-[#626b64]">Brand *</span><select className="input" disabled={!category} {...register("brand", { required: "Brand is required" })}><option value="" disabled>{category ? "Select brand" : "Select product type first"}</option>{availableBrands.map((brand) => <option key={brand}>{brand}</option>)}<option value="__custom__">Other / Add custom brand</option></select>{errors.brand && <span className="mt-1 block text-[10px] text-red-600">{errors.brand.message}</span>}</label>
        {selectedBrand === "__custom__" && <label><span className="mb-2 block text-[11px] font-bold text-[#626b64]">Custom brand *</span><input autoFocus placeholder="Type the brand name" className="input" {...register("customBrand", { required: "Brand name is required", validate: (value) => Boolean(value?.trim()) || "Brand name is required" })}/>{errors.customBrand && <span className="mt-1 block text-[10px] text-red-600">{errors.customBrand.message}</span>}</label>}
        <label><span className="mb-2 block text-[11px] font-bold text-[#626b64]">Model *</span><input placeholder="Model name" className="input" {...register("model", { required: true })}/></label>
        <label><span className="mb-2 block text-[11px] font-bold text-[#626b64]">Slug</span><input type="hidden" {...register("slug")}/><input value={slug || ""} disabled aria-label="Auto-generated slug" className="input cursor-not-allowed bg-[#f1f2f0] text-[#858c87]"/></label>
        {fields.map(([name, label, placeholder, inputMode]) => <label key={name}><span className="mb-2 block text-[11px] font-bold text-[#626b64]">{label}{name === "price" ? " *" : <span className="font-normal text-[#929993]"> (optional)</span>}</span>{name === "price" ? <Controller name="price" control={control} rules={{ required: "Price is required" }} render={({ field }) => <input ref={field.ref} name={field.name} value={formatIndianNumber(field.value)} onBlur={field.onBlur} onChange={(event) => field.onChange(event.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="1,19,900" className="input"/>}/> : <input inputMode={inputMode} pattern={inputMode === "numeric" ? "[0-9]*" : inputMode === "decimal" ? "[0-9]+([.][0-9]+)?" : undefined} placeholder={placeholder} className="input" {...register(name)}/>} {errors[name] && <span className="mt-1 block text-[10px] text-red-600">{errors[name].message || "This field is required"}</span>}</label>)}
        {[["imei", "IMEI number 1"], ["imei2", "IMEI number 2"]].map(([name, label]) => <label key={name}><span className="mb-2 block text-[11px] font-bold text-[#626b64]">{label} <span className="font-normal text-[#929993]">(optional)</span></span><div className="flex flex-col gap-2"><input inputMode="numeric" pattern="[0-9]{15}" maxLength={15} placeholder="15-digit IMEI" className="input" {...register(name, { pattern: { value: /^\d{15}$/, message: `${label} must be exactly 15 digits` } })}/><button type="button" onClick={() => setScannerField(name)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#173f2c] px-4 py-2.5 text-[11px] font-bold text-[#173f2c] transition hover:bg-[#edf4ef]"><ScanLine size={16}/>Scan {label}</button></div>{errors[name] && <span className="mt-1 block text-[10px] text-red-600">{errors[name].message}</span>}</label>)}
      </div><label className="mt-5 block"><span className="mb-2 block text-[11px] font-bold text-[#626b64]">Description <span className="font-normal text-[#929993]">(optional)</span></span><textarea rows="5" className="input resize-none" placeholder="Describe the product, its strengths, and condition…" {...register("description")}/></label></section>
      <div className="grid content-start gap-6">
        <section className="rounded-[22px] border border-[#e1e4e1] bg-white p-5"><h2 className="text-sm font-black">Product images</h2><p className="mt-1 text-[11px] text-[#858c87]">Upload 1–3 images. Large files are automatically optimized to high-quality WebP.</p><label className="mt-5 flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-[#cbd1cc] bg-[#f8f9f7] px-5 py-8 text-center hover:bg-[#f2f5f1]"><ImagePlus size={23}/><span className="mt-3 text-xs font-bold">Choose 1–3 images</span><span className="mt-1 text-[10px] text-[#8b928c]">JPG, PNG, WebP or AVIF · 8MB max each</span><input name="images" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={selectImages}/></label>{selectedFiles.length > 0 && <p className="mt-3 text-[10px] font-bold text-[#66706a]">{selectedFiles.length} optimized images · {formatBytes(selectedFiles.reduce((sum, file) => sum + file.size, 0))}</p>}{previews.length > 0 && <div className="mt-4 grid grid-cols-3 gap-2">{previews.map((src, index) => <div key={`${src}-${index}`} className="relative aspect-square overflow-hidden rounded-xl bg-[#f1f2f0]"><Image src={src} fill alt={`Preview ${index + 1}`} className="object-cover" sizes="100px"/></div>)}</div>}</section>
        <section className="rounded-[22px] border border-[#e1e4e1] bg-white p-5"><h2 className="text-sm font-black">Listing options</h2><label className="mt-5 block text-[11px] font-bold">Condition *<select className="input mt-2" {...register("condition", { required: "Condition is required" })}><option value="" disabled>Select condition</option><option>New</option><option>Excellent</option><option>Good</option><option>Fair</option></select>{errors.condition && <span className="mt-1 block text-[10px] text-red-600">{errors.condition.message}</span>}</label><label className="mt-5 block text-[11px] font-bold">Status *<select className="input mt-2" {...register("status", { required: "Status is required" })}><option value="" disabled>Select status</option><option>Available</option><option>Sold</option><option>Block</option></select>{errors.status && <span className="mt-1 block text-[10px] text-red-600">{errors.status.message}</span>}</label><div className="mt-5 grid gap-4">{[["visible", "Show on website"], ["featured", "Feature on home page"], ["latest", "Mark as latest stock"]].map(([name, label]) => <label key={name} className="flex items-center justify-between text-xs font-bold"><span>{label}</span><input type="checkbox" className="h-4 w-4 accent-[#173f2c]" {...register(name)}/></label>)}</div></section>
      </div>
    </div>
    <BarcodeScannerModal open={Boolean(scannerField)} targetLabel={scannerField === "imei2" ? "IMEI 2" : "IMEI 1"} onClose={() => setScannerField(null)} onDetected={(value) => { if (!scannerField) return; setValue(scannerField, value, { shouldDirty: true, shouldValidate: true }); toast.success(`${scannerField === "imei2" ? "IMEI 2" : "IMEI 1"} scanned and filled`); }}/>
  </form>;
}
