import mongoose from "mongoose";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/db";
import { deleteImages, uploadImage } from "@/lib/cloudinary";
import { handleError, ok, requireAdmin } from "@/lib/api";
import { phones as demoPhones } from "@/lib/demo-data";
import { enforceRateLimit } from "@/lib/rate-limit";
import { parsePhoneForm, publicPhoneFields, validateImageFiles } from "@/lib/phone-input";
import Phone from "@/models/Phone";

const findFilter = (id) => mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };

function cached(data) {
  const response = ok(data);
  response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=600");
  return response;
}

export async function GET(request, { params }) {
  try {
    await enforceRateLimit(request, { scope: "phone-read", limit: 180 });
    const { id } = await params;
    if (!process.env.MONGODB_URI) {
      const phone = demoPhones.find((item) => item._id === id || item.slug === id);
      if (!phone) throw Object.assign(new Error("Phone not found"), { status: 404 });
      return cached(phone);
    }
    await connectDB();
    const phone = await Phone.findOne(findFilter(id)).select(publicPhoneFields).lean().maxTimeMS(5000);
    if (!phone) throw Object.assign(new Error("Phone not found"), { status: 404 });
    return cached(phone);
  } catch (error) { return handleError(error); }
}

export async function PUT(request, { params }) {
  let uploaded = [];
  try {
    await enforceRateLimit(request, { scope: "phones-write", limit: 30 });
    await requireAdmin();
    if (Number(request.headers.get("content-length") || 0) > 70 * 1024 * 1024) throw Object.assign(new Error("Upload is too large"), { status: 413 });
    const { id } = await params;
    await connectDB();
    const current = await Phone.findOne(findFilter(id)).maxTimeMS(5000);
    if (!current) throw Object.assign(new Error("Phone not found"), { status: 404 });
    const form = await request.formData();
    const files = form.getAll("images").filter((file) => file?.size);
    validateImageFiles(files, false);
    const previousImages = current.images.map((image) => image.toObject());
    if (files.length) uploaded = await Promise.all(files.map(uploadImage));
    Object.assign(current, { ...parsePhoneForm(form), images: uploaded.length ? uploaded : current.images });
    await current.save();
    if (uploaded.length) await deleteImages(previousImages).catch(() => {});
    revalidateTag("phones", "max");
    return ok(current);
  } catch (error) {
    if (uploaded.length) await deleteImages(uploaded).catch(() => {});
    return handleError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    await enforceRateLimit(request, { scope: "phones-write", limit: 30 });
    await requireAdmin();
    const { id } = await params;
    await connectDB();
    const phone = await Phone.findOneAndDelete(findFilter(id)).select("images").maxTimeMS(5000);
    if (!phone) throw Object.assign(new Error("Phone not found"), { status: 404 });
    await deleteImages(phone.images).catch(() => {});
    revalidateTag("phones", "max");
    return ok({ id });
  } catch (error) { return handleError(error); }
}
