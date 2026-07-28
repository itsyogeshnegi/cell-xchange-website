import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { handleError, ok, requireAdmin } from "@/lib/api";
import { deleteImages, uploadBrandLogo, uploadSiteImage } from "@/lib/cloudinary";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createStoreProfile, editableStoreFields } from "@/lib/store";
import StoreSettings from "@/models/StoreSettings";

const clean = (value, max) => String(value || "").trim().slice(0, max);
const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function PUT(request) {
  let uploadedImages = [];
  let uploadedLogo;
  let saved = false;
  try {
    await enforceRateLimit(request, { scope: "settings-write", limit: 20 });
    await requireAdmin();
    if (Number(request.headers.get("content-length") || 0) > 75 * 1024 * 1024) throw Object.assign(new Error("Settings upload is too large"), { status: 413 });
    const form = await request.formData();
    const values = Object.fromEntries(editableStoreFields.map((field) => [field, clean(form.get(field), 2000)]));
    values.name = clean(form.get("name"), 80);
    values.email = clean(form.get("email"), 160).toLowerCase();
    values.phoneDisplay = clean(form.get("phoneDisplay"), 30);
    values.hours = clean(form.get("hours"), 80);
    values.offerBarEnabled = form.get("offerBarEnabled") === "true";
    values.showInstagram = form.get("showInstagram") === "true";
    values.showYoutube = form.get("showYoutube") === "true";
    values.showWhatsapp = form.get("showWhatsapp") === "true";
    values.showInvoiceHeader = form.get("showInvoiceHeader") === "true";
    if (!values.name || !values.email || !values.phoneDisplay || !values.hours) throw Object.assign(new Error("All store profile fields are required"), { status: 422 });
    if (!/^\S+@\S+\.\S+$/.test(values.email)) throw Object.assign(new Error("Enter a valid contact email"), { status: 422 });
    if (values.phoneDisplay.replace(/\D/g, "").length < 10) throw Object.assign(new Error("Enter a valid phone number"), { status: 422 });
    for (const field of ["instagramUrl", "youtubeUrl", "footerWhatsappUrl"]) {
      if (!values[field]) continue;
      let url;
      try { url = new URL(values[field]); } catch { throw Object.assign(new Error(`Enter a valid ${field.replace(/Url$/, "")} URL`), { status: 422 }); }
      if (!["http:", "https:"].includes(url.protocol)) throw Object.assign(new Error("Social links must use http or https"), { status: 422 });
    }
    const heroFiles = form.getAll("heroImageFiles").filter((file) => file?.size);
    if (heroFiles.length > 8) throw Object.assign(new Error("Use no more than 8 hero images"), { status: 422 });
    for (const file of heroFiles) {
      if (file.size > 8 * 1024 * 1024 || !imageTypes.includes(file.type)) throw Object.assign(new Error("Use JPG, PNG, WebP, or AVIF hero images under 8MB each"), { status: 422 });
    }
    let heroOrder = [];
    try { heroOrder = JSON.parse(clean(form.get("heroImageOrder"), 12000) || "[]"); } catch {
      throw Object.assign(new Error("Hero image order is invalid"), { status: 422 });
    }
    if (!Array.isArray(heroOrder) || !heroOrder.length || heroOrder.length > 8) throw Object.assign(new Error("Keep between 1 and 8 hero images"), { status: 422 });
    for (const file of heroFiles) uploadedImages.push(await uploadSiteImage(file));
    const heroImages = heroOrder.map((item) => {
      if (item?.type === "new" && Number.isInteger(item.index)) return uploadedImages[item.index];
      if (item?.type === "existing") {
        const url = clean(item.url, 1000);
        const publicId = clean(item.publicId, 300);
        let validUrl = url.startsWith("/");
        if (!validUrl) {
          try { validUrl = new URL(url).hostname === "res.cloudinary.com"; } catch {}
        }
        if (validUrl && (!publicId || publicId.startsWith("mobile-hub/site/"))) return { url, publicId };
      }
      return null;
    }).filter(Boolean);
    if (heroImages.length !== heroOrder.length || !heroImages.length) throw Object.assign(new Error("One or more hero images are invalid"), { status: 422 });
    values.heroImages = heroImages;
    values.heroImage = heroImages[0];
    const logoFile = form.get("brandLogo");
    if (logoFile?.size) {
      if (logoFile.size > 5 * 1024 * 1024 || !imageTypes.includes(logoFile.type)) throw Object.assign(new Error("Use a JPG, PNG, WebP, or AVIF logo under 5MB"), { status: 422 });
      uploadedLogo = await uploadBrandLogo(logoFile);
      values.brandLogo = uploadedLogo;
    }
    const stagedLogoUrl = clean(form.get("brandLogoUrl"), 1000);
    const stagedLogoPublicId = clean(form.get("brandLogoPublicId"), 300);
    if (stagedLogoUrl || stagedLogoPublicId) {
      let hostname = "";
      try { hostname = new URL(stagedLogoUrl).hostname; } catch {}
      if (hostname !== "res.cloudinary.com" || !stagedLogoPublicId.startsWith("mobile-hub/branding/")) throw Object.assign(new Error("Invalid staged brand logo"), { status: 422 });
      values.brandLogo = { url: stagedLogoUrl, publicId: stagedLogoPublicId };
    }
    await connectDB();
    const previous = await StoreSettings.findOne({ key: "primary" }).select("brandLogo heroImage heroImages").lean().maxTimeMS(5000);
    const settings = await StoreSettings.findOneAndUpdate(
      { key: "primary" },
      { $set: values, $setOnInsert: { key: "primary" } },
      { new: true, upsert: true, runValidators: true, strict: false },
    ).lean();
    saved = true;
    const retainedHeroIds = new Set(values.heroImages.map((image) => image.publicId).filter(Boolean));
    const previousHeroImages = [...(previous?.heroImages || []), previous?.heroImage].filter((image) => image?.publicId && !retainedHeroIds.has(image.publicId));
    await deleteImages(previousHeroImages).catch(() => {});
    if (values.brandLogo?.publicId && values.brandLogo.publicId !== previous?.brandLogo?.publicId && previous?.brandLogo?.publicId) await deleteImages([previous.brandLogo]).catch(() => {});
    revalidatePath("/", "layout");
    revalidatePath("/about");
    revalidatePath("/login");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/content");
    revalidatePath("/dashboard/settings");
    return ok(createStoreProfile(settings));
  } catch (error) {
    if (!saved) await deleteImages([...uploadedImages, uploadedLogo].filter(Boolean)).catch(() => {});
    return handleError(error);
  }
}
