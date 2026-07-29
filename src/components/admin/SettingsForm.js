"use client";

import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowDown, ArrowUp, ImagePlus, LoaderCircle, Save, Trash2, UploadCloud, X } from "lucide-react";

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
      ["heroBannerText", "Banner text"],
    ],
  },
  {
    title: "Offer ticker",
    description: "Control the scrolling offer message displayed directly below the storefront navigation.",
    fields: [
      ["offerBarEnabled", "Show offer ticker", "toggle"],
      ["offerBarText", "Offer message", "textarea"],
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
      ["instagramUrl", "Instagram URL", "url"],
      ["showInstagram", "Show Instagram icon", "toggle", "Display the Instagram icon in the website footer."],
      ["youtubeUrl", "YouTube URL", "url"],
      ["showYoutube", "Show YouTube icon", "toggle", "Display the YouTube icon in the website footer."],
      ["footerWhatsappUrl", "WhatsApp URL", "url"],
      ["showWhatsapp", "Show WhatsApp icon", "toggle", "Display the WhatsApp icon in the website footer."],
    ],
  },
  {
    title: "Invoice settings",
    description: "Admin-controlled content used on newly generated invoices.",
    fields: [
      ["showInvoiceHeader", "Show invoice header", "toggle", "Display the custom heading on generated invoices."],
      ["invoiceHeader", "Invoice header"],
      ["invoiceTermsText", "Terms and conditions (one per line)", "textarea"],
    ],
  },
];

export default function SettingsForm({ initialSettings, mode = "content" }) {
  const router = useRouter();
  const [values, setValues] = useState(initialSettings);
  const initialHeroImages = initialSettings.heroImages?.length ? initialSettings.heroImages : [initialSettings.heroImage || { url: "/hero-black", publicId: "" }];
  const [logoPreview, setLogoPreview] = useState(initialSettings.brandLogo?.url || "");
  const [stagedLogo, setStagedLogo] = useState(null);
  const [pendingLogoFile, setPendingLogoFile] = useState(null);
  const [pendingLogoPreview, setPendingLogoPreview] = useState("");
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoInputKey, setLogoInputKey] = useState(0);
  const [heroItems, setHeroItems] = useState(() => initialHeroImages.map((image, index) => ({ ...image, id: `saved-${image.publicId || index}`, file: null })));
  const [heroInputKey, setHeroInputKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  const chooseHero = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    if (heroItems.length + files.length > 8) { toast.error("You can use up to 8 hero images"); event.target.value = ""; return; }
    if (files.some((file) => file.size > 8 * 1024 * 1024)) { toast.error("Each hero image must be under 8MB"); event.target.value = ""; return; }
    const additions = files.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      publicId: "",
      file,
    }));
    setHeroItems((current) => [...current, ...additions]);
    setHeroInputKey((value) => value + 1);
  };
  const moveHero = (index, direction) => setHeroItems((current) => {
    const target = index + direction;
    if (target < 0 || target >= current.length) return current;
    const next = [...current];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });
  const removeHero = (index) => setHeroItems((current) => {
    if (current.length === 1) { toast.error("Keep at least one hero image"); return current; }
    const removed = current[index];
    if (removed.file) URL.revokeObjectURL(removed.url);
    return current.filter((_, itemIndex) => itemIndex !== index);
  });
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
      Object.entries(values).forEach(([key, value]) => { if (typeof value === "string" || typeof value === "boolean") body.append(key, String(value)); });
      if (stagedLogo) { body.append("brandLogoUrl", stagedLogo.url); body.append("brandLogoPublicId", stagedLogo.publicId); }
      const newHeroItems = heroItems.filter((item) => item.file);
      newHeroItems.forEach((item) => body.append("heroImageFiles", item.file));
      body.append("heroImageOrder", JSON.stringify(heroItems.map((item) => item.file
        ? { type: "new", index: newHeroItems.indexOf(item) }
        : { type: "existing", url: item.url, publicId: item.publicId || "" })));
      const { data } = await axios.put("/api/settings", body);
      if (stagedLogo && data.data.brandLogo?.publicId !== stagedLogo.publicId) throw new Error("Logo URL was not persisted");
      heroItems.filter((item) => item.file).forEach((item) => URL.revokeObjectURL(item.url));
      setValues(data.data);
      setStagedLogo(null);
      setLogoPreview(data.data.brandLogo?.url || "");
      setHeroItems((data.data.heroImages?.length ? data.data.heroImages : [data.data.heroImage]).map((image, index) => ({ ...image, id: `saved-${image.publicId || index}`, file: null })));
      router.refresh();
      toast.success(mode === "profile" ? "Store settings saved" : "Website content saved");
    } catch (error) { toast.error(error.response?.data?.message || "Could not save website content"); }
    finally { setSaving(false); }
  };

  const visibleSections = mode === "profile"
    ? sections.filter((section) => ["Store profile", "Invoice settings"].includes(section.title))
    : sections.filter((section) => section.title !== "Invoice settings");

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
        <div className="flex items-end justify-between gap-4">
          <span><span className="block text-[11px] font-bold">Hero carousel images</span><span className="mt-1 block text-[10px] text-[#858c87]">Priority 1 appears first. Images rotate automatically in this order.</span></span>
          <span className="text-[10px] font-bold text-[#747c76]">{heroItems.length}/8 images</span>
        </div>
        <div className="mt-3 grid gap-3">
          {heroItems.map((item, index) => <div key={item.id} className="grid gap-3 rounded-2xl border border-[#e1e4e1] bg-[#f8f9f7] p-3 sm:grid-cols-[110px_1fr_auto] sm:items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#eceeeb]"><Image src={item.url} fill sizes="110px" className="object-cover" alt={`Hero priority ${index + 1} preview`}/></div>
            <div><p className="text-xs font-black">Priority {index + 1}</p><p className="mt-1 text-[10px] text-[#7a817c]">{item.file ? item.file.name : index === 0 ? "First carousel slide" : `Carousel slide ${index + 1}`}</p></div>
            <div className="flex items-center gap-1 sm:justify-end">
              <button type="button" onClick={() => moveHero(index, -1)} disabled={index === 0} aria-label={`Move hero image ${index + 1} up`} className="grid size-9 place-items-center rounded-full border border-[#d9ddda] bg-white disabled:opacity-30"><ArrowUp size={15}/></button>
              <button type="button" onClick={() => moveHero(index, 1)} disabled={index === heroItems.length - 1} aria-label={`Move hero image ${index + 1} down`} className="grid size-9 place-items-center rounded-full border border-[#d9ddda] bg-white disabled:opacity-30"><ArrowDown size={15}/></button>
              <button type="button" onClick={() => removeHero(index)} disabled={heroItems.length === 1} aria-label={`Remove hero image ${index + 1}`} className="grid size-9 place-items-center rounded-full border border-[#ead8d8] bg-white text-red-600 disabled:opacity-30"><Trash2 size={15}/></button>
            </div>
          </div>)}
        </div>
        {heroItems.length < 8 && <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[#cbd1cc] bg-[#f8f9f7] px-5 py-6 text-xs font-bold hover:bg-[#f2f5f1]"><ImagePlus size={18}/>Add hero images<input key={heroInputKey} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={chooseHero}/></label>}
        <p className="mt-2 text-[10px] text-[#858c87]">JPG, PNG, WebP, or AVIF · 8MB maximum each. Save website content to publish the order.</p>
      </div>}
      <div className="mt-6 grid gap-5 sm:grid-cols-2">{section.fields.map(([name, label, type = "text", help]) => type === "toggle" ? <label key={name} className="flex items-center justify-between gap-5 rounded-2xl border border-[#e1e4e1] bg-[#f8f9f7] px-4 py-4 sm:col-span-2"><span><span className="block text-[11px] font-bold">{label}</span><span className="mt-1 block text-[10px] font-normal text-[#7a817c]">{help || "Turn this off to hide the offer bar from the website."}</span></span><input name={name} type="checkbox" checked={Boolean(values[name])} onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.checked }))} className="h-4 w-4" /></label> : <label key={name} className={`text-[11px] font-bold ${type === "textarea" ? "sm:col-span-2" : ""}`}>{label}{type === "textarea" ? <textarea name={name} rows="3" value={values[name] || ""} onChange={update} className="input mt-2 resize-y"/> : <input name={name} type={type} value={values[name] || ""} onChange={update} className="input mt-2"/>}</label>)}</div>
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
