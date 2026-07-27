"use client";

import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { ImagePlus, LoaderCircle, Save, UploadCloud, X } from "lucide-react";

const sections = [
  {
    title: "Store profile",
    description: "Contact, address, and opening information used throughout the website.",
    fields: [
      ["name", "Store name"], ["email", "Contact email", "email"], ["phoneDisplay", "Phone", "tel"],
      ["hours", "Opening hours"], ["days", "Opening days"], ["addressLine1", "Address line 1"],
      ["addressLine2", "Address line 2"], ["mapUrl", "Google Maps URL"],
    ],
  },
  {
    title: "Home — hero",
    description: "The first message and main image customers see.",
    fields: [
      ["heroEyebrow", "Eyebrow"], ["heroTitle", "Main heading"], ["heroTitleAccent", "Accent heading"],
      ["heroDescription", "Description", "textarea"], ["heroPrimaryCta", "Primary button"],
      ["heroSecondaryCta", "WhatsApp button"], ["heroImageAlt", "Hero image description"],
    ],
  },
  {
    title: "Home — stock and visit",
    fields: [
      ["latestEyebrow", "Inventory eyebrow"], ["latestTitle", "Inventory heading"],
      ["stockEyebrow", "Stock section eyebrow"], ["stockTitle", "Stock heading"],
      ["stockTitleAccent", "Stock accent heading"], ["stockDescription", "Stock description", "textarea"],
      ["stockCta", "Stock button"], ["visitEyebrow", "Visit eyebrow"], ["visitTitle", "Visit heading"],
      ["visitTitleAccent", "Visit accent heading"], ["visitDescription", "Visit description", "textarea"],
      ["directionsCta", "Directions button"],
    ],
  },
  {
    title: "Home — trust cards",
    fields: [
      ["trustTitle1", "Card 1 title"], ["trustText1", "Card 1 text", "textarea"],
      ["trustTitle2", "Card 2 title"], ["trustText2", "Card 2 text", "textarea"],
      ["trustTitle3", "Card 3 title"], ["trustText3", "Card 3 text", "textarea"],
    ],
  },
  {
    title: "Our store page",
    fields: [
      ["aboutEyebrow", "Page eyebrow"], ["aboutTitle", "Main heading"], ["aboutTitleAccent", "Accent heading"],
      ["aboutIntro", "Introduction", "textarea"], ["beliefEyebrow", "Belief eyebrow"],
      ["beliefTitle", "Belief heading"], ["beliefDescription", "Belief description", "textarea"],
      ["beliefItem1", "Value 1"], ["beliefItem2", "Value 2"], ["beliefItem3", "Value 3"], ["beliefItem4", "Value 4"],
    ],
  },
  {
    title: "Contact and footer",
    fields: [
      ["contactEyebrow", "Contact eyebrow"], ["contactTitle", "Contact heading"],
      ["contactDescription", "Contact description", "textarea"], ["availabilityEyebrow", "Availability eyebrow"],
      ["availabilityTitle", "Availability heading"], ["availabilityCta", "WhatsApp button"],
      ["footerDescription", "Footer description", "textarea"],
    ],
  },
];

export default function SettingsForm({ initialSettings, mode = "content" }) {
  const router = useRouter();
  const [values, setValues] = useState(initialSettings);
  const [logoPreview, setLogoPreview] = useState(initialSettings.brandLogo?.url || "");
  const [stagedLogo, setStagedLogo] = useState(null);
  const [pendingLogoFile, setPendingLogoFile] = useState(null);
  const [pendingLogoPreview, setPendingLogoPreview] = useState("");
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoInputKey, setLogoInputKey] = useState(0);
  const [heroFile, setHeroFile] = useState(null);
  const [heroPreview, setHeroPreview] = useState(initialSettings.heroImage?.url || "/hero-black");
  const [saving, setSaving] = useState(false);
  const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  const chooseHero = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast.error("Hero image must be under 8MB"); event.target.value = ""; return; }
    setHeroFile(file);
    setHeroPreview(URL.createObjectURL(file));
  };
  const chooseLogo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Brand logo must be under 5MB"); event.target.value = ""; return; }
    setPendingLogoFile(file);
    setPendingLogoPreview(URL.createObjectURL(file));
    setLogoModalOpen(true);
  };
  const cancelLogo = () => {
    if (pendingLogoPreview) URL.revokeObjectURL(pendingLogoPreview);
    setPendingLogoFile(null); setPendingLogoPreview(""); setLogoModalOpen(false); setLogoInputKey((value) => value + 1);
  };
  const uploadLogo = async () => {
    if (!pendingLogoFile) return;
    setUploadingLogo(true);
    try {
      const body = new FormData();
      body.append("logo", pendingLogoFile);
      const { data } = await axios.post("/api/settings/logo", body);
      if (stagedLogo?.publicId) await axios.delete("/api/settings/logo", { data: { publicId: stagedLogo.publicId } }).catch(() => {});
      setStagedLogo(data.data);
      setLogoPreview(data.data.url);
      toast.success("Logo uploaded to Cloudinary. Save settings to activate it.");
      cancelLogo();
    } catch (error) { toast.error(error.response?.data?.message || "Could not upload logo"); }
    finally { setUploadingLogo(false); }
  };
  const submit = async (event) => {
    event.preventDefault(); setSaving(true);
    try {
      const body = new FormData();
      Object.entries(values).forEach(([key, value]) => { if (typeof value === "string") body.append(key, value); });
      if (stagedLogo) { body.append("brandLogoUrl", stagedLogo.url); body.append("brandLogoPublicId", stagedLogo.publicId); }
      if (heroFile) body.append("heroImage", heroFile);
      const { data } = await axios.put("/api/settings", body);
      if (stagedLogo && data.data.brandLogo?.publicId !== stagedLogo.publicId) throw new Error("Logo URL was not persisted");
      setValues(data.data); setStagedLogo(null); setLogoPreview(data.data.brandLogo?.url || ""); setHeroFile(null); setHeroPreview(data.data.heroImage?.url || "/hero-black");
      router.refresh();
      toast.success(mode === "profile" ? "Store settings saved" : "Website content saved");
    } catch (error) { toast.error(error.response?.data?.message || "Could not save website content"); }
    finally { setSaving(false); }
  };

  const visibleSections = mode === "profile" ? sections.slice(0, 1) : sections;

  return <form onSubmit={submit} className="mt-8 grid gap-6">
    {visibleSections.map((section) => <section key={section.title} className="rounded-[22px] border border-[#e1e4e1] bg-white p-6">
      <h2 className="text-sm font-black">{section.title}</h2>
      {section.description && <p className="mt-2 text-xs text-[#7a817c]">{section.description}</p>}
      {section.title === "Store profile" && <div className="mt-6">
        <span className="text-[11px] font-bold">Brand logo</span>
        <div className="mt-2 grid gap-4 sm:grid-cols-[220px_1fr] sm:items-center">
          <div className="flex aspect-[3/1] items-center justify-center overflow-hidden rounded-2xl border border-[#e1e4e1] bg-[#f8f9f7] p-4">{logoPreview ? <div className="relative h-full w-full"><Image src={logoPreview} fill sizes="220px" className="object-contain" alt="Brand logo preview"/></div> : <div className="inline-flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-black text-[10px] font-black text-white">c.x</span><span className="text-base font-bold">{values.name || "cell.xchange"}</span></div>}</div>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[#cbd1cc] bg-[#f8f9f7] px-5 py-7 text-xs font-bold hover:bg-[#f2f5f1]"><ImagePlus size={18}/>Select brand logo<input key={logoInputKey} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={chooseLogo}/></label>
        </div>
        {stagedLogo && <p className="mt-3 rounded-xl bg-[#edf7ef] px-3 py-2 text-[10px] font-bold text-[#24613d]">Uploaded to Cloudinary. Click Save settings to activate this logo.</p>}
        <p className="mt-2 text-[10px] text-[#858c87]">Transparent PNG, WebP, JPG, or AVIF · 5MB maximum. A horizontal logo works best.</p>
      </div>}
      {section.title === "Home — hero" && <div className="mt-6">
        <span className="text-[11px] font-bold">Hero image</span>
        <div className="mt-2 grid gap-4 sm:grid-cols-[220px_1fr] sm:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#f2f3f1]"><Image src={heroPreview} fill sizes="220px" className="object-cover" alt="Hero preview"/></div>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[#cbd1cc] bg-[#f8f9f7] px-5 py-7 text-xs font-bold hover:bg-[#f2f5f1]"><ImagePlus size={18}/>Replace hero image<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={chooseHero}/></label>
        </div>
      </div>}
      <div className="mt-6 grid gap-5 sm:grid-cols-2">{section.fields.map(([name, label, type = "text"]) => <label key={name} className={`text-[11px] font-bold ${type === "textarea" ? "sm:col-span-2" : ""}`}>{label}{type === "textarea" ? <textarea name={name} rows="3" value={values[name] || ""} onChange={update} className="input mt-2 resize-y"/> : <input name={name} type={type} value={values[name] || ""} onChange={update} className="input mt-2"/>}</label>)}</div>
    </section>)}
    <div className="sticky bottom-4 z-10"><button disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-[#173f2c] px-6 py-3.5 text-xs font-bold text-white shadow-lg disabled:opacity-60">{saving ? <LoaderCircle size={15} className="animate-spin"/> : <Save size={15}/>}Save {mode === "profile" ? "settings" : "website content"}</button></div>
    {logoModalOpen && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="logo-upload-title">
      <div className="w-full max-w-lg rounded-[24px] bg-white p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><h2 id="logo-upload-title" className="text-lg font-black">Upload brand logo</h2><p className="mt-1 text-xs text-[#747c76]">Review the selected image before uploading it to Cloudinary.</p></div><button type="button" onClick={cancelLogo} disabled={uploadingLogo} aria-label="Close logo upload" className="grid h-9 w-9 place-items-center rounded-full bg-[#f2f3f1] disabled:opacity-50"><X size={17}/></button></div>
        <div className="relative mt-6 aspect-[3/1] overflow-hidden rounded-2xl border border-[#e1e4e1] bg-[#f7f8f6] p-4"><Image src={pendingLogoPreview} fill sizes="480px" className="object-contain p-4" alt="Selected brand logo"/></div>
        <p className="mt-3 truncate text-[10px] text-[#747c76]">{pendingLogoFile?.name}</p>
        <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={cancelLogo} disabled={uploadingLogo} className="rounded-full border border-[#d8dcd8] px-5 py-3 text-xs font-bold disabled:opacity-50">Cancel</button><button type="button" onClick={uploadLogo} disabled={uploadingLogo} className="inline-flex items-center gap-2 rounded-full bg-[#173f2c] px-5 py-3 text-xs font-bold text-white disabled:opacity-60">{uploadingLogo ? <LoaderCircle size={15} className="animate-spin"/> : <UploadCloud size={15}/>}Upload</button></div>
      </div>
    </div>}
  </form>;
}
