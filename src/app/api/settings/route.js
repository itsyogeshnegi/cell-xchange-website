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
  let uploadedImage;
  let uploadedLogo;
  let saved = false;
  try {
    await enforceRateLimit(request, { scope: "settings-write", limit: 20 });
    await requireAdmin();
    if (Number(request.headers.get("content-length") || 0) > 20 * 1024 * 1024) throw Object.assign(new Error("Settings upload is too large"), { status: 413 });
    const form = await request.formData();
    const values = Object.fromEntries(editableStoreFields.map((field) => [field, clean(form.get(field), 2000)]));
    values.name = clean(form.get("name"), 80);
    values.email = clean(form.get("email"), 160).toLowerCase();
    values.phoneDisplay = clean(form.get("phoneDisplay"), 30);
    values.hours = clean(form.get("hours"), 80);
    values.offerBarEnabled = form.get("offerBarEnabled") === "true";
    if (!values.name || !values.email || !values.phoneDisplay || !values.hours) throw Object.assign(new Error("All store profile fields are required"), { status: 422 });
    if (!/^\S+@\S+\.\S+$/.test(values.email)) throw Object.assign(new Error("Enter a valid contact email"), { status: 422 });
    if (values.phoneDisplay.replace(/\D/g, "").length < 10) throw Object.assign(new Error("Enter a valid phone number"), { status: 422 });
    const heroFile = form.get("heroImage");
    if (heroFile?.size) {
      if (heroFile.size > 8 * 1024 * 1024 || !imageTypes.includes(heroFile.type)) throw Object.assign(new Error("Use a JPG, PNG, WebP, or AVIF hero image under 8MB"), { status: 422 });
      uploadedImage = await uploadSiteImage(heroFile);
      values.heroImage = uploadedImage;
    }
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
    const previous = await StoreSettings.findOne({ key: "primary" }).select("brandLogo heroImage").lean().maxTimeMS(5000);
    const settings = await StoreSettings.findOneAndUpdate(
      { key: "primary" },
      { $set: values, $setOnInsert: { key: "primary" } },
      { new: true, upsert: true, runValidators: true, strict: false },
    ).lean();
    saved = true;
    if (uploadedImage && previous?.heroImage?.publicId) await deleteImages([previous.heroImage]).catch(() => {});
    if (values.brandLogo?.publicId && values.brandLogo.publicId !== previous?.brandLogo?.publicId && previous?.brandLogo?.publicId) await deleteImages([previous.brandLogo]).catch(() => {});
    revalidatePath("/", "layout");
    revalidatePath("/about");
    revalidatePath("/login");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/content");
    revalidatePath("/dashboard/settings");
    return ok(createStoreProfile(settings));
  } catch (error) {
    if (!saved) await deleteImages([uploadedImage, uploadedLogo].filter(Boolean)).catch(() => {});
    return handleError(error);
  }
}
