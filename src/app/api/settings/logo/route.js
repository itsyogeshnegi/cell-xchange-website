import { deleteImages, uploadBrandLogo } from "@/lib/cloudinary";
import { handleError, ok, requireAdmin } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const validPublicId = (value) => typeof value === "string" && value.startsWith("mobile-hub/branding/");

export async function POST(request) {
  let uploaded;
  try {
    await enforceRateLimit(request, { scope: "logo-upload", limit: 20 });
    await requireAdmin();
    if (Number(request.headers.get("content-length") || 0) > 6 * 1024 * 1024) throw Object.assign(new Error("Logo upload is too large"), { status: 413 });
    const form = await request.formData();
    const file = form.get("logo");
    if (!file?.size) throw Object.assign(new Error("Choose a logo image"), { status: 422 });
    if (file.size > 5 * 1024 * 1024 || !imageTypes.includes(file.type)) throw Object.assign(new Error("Use a JPG, PNG, WebP, or AVIF logo under 5MB"), { status: 422 });
    uploaded = await uploadBrandLogo(file);
    return ok(uploaded, 201);
  } catch (error) {
    if (uploaded) await deleteImages([uploaded]).catch(() => {});
    return handleError(error);
  }
}

export async function DELETE(request) {
  try {
    await enforceRateLimit(request, { scope: "logo-delete", limit: 20 });
    await requireAdmin();
    const { publicId } = await request.json();
    if (!validPublicId(publicId)) throw Object.assign(new Error("Invalid staged logo"), { status: 422 });
    await deleteImages([{ publicId }]);
    return ok({ deleted: true });
  } catch (error) { return handleError(error); }
}
