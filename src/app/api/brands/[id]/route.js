import mongoose from "mongoose";
import { revalidatePath, revalidateTag } from "next/cache";
import { connectDB } from "@/lib/db";
import { handleError, ok, requireDashboardUser } from "@/lib/api";
import { normalizeBrandKey, normalizeBrandName, productCategories } from "@/lib/brands";
import { enforceRateLimit } from "@/lib/rate-limit";
import Brand from "@/models/Brand";
import Phone from "@/models/Phone";

function validId(id) {
  if (!mongoose.isValidObjectId(id)) throw Object.assign(new Error("Brand not found"), { status: 404 });
}

export async function PATCH(request, { params }) {
  try {
    await enforceRateLimit(request, { scope: "brands-write", limit: 30, windowMs: 15 * 60_000 });
    await requireDashboardUser();
    const { id } = await params;
    validId(id);
    if (Number(request.headers.get("content-length") || 0) > 10_000) throw Object.assign(new Error("Request is too large"), { status: 413 });
    const body = await request.json();
    const name = normalizeBrandName(body.name);
    const categories = [...new Set(Array.isArray(body.categories) ? body.categories.filter((category) => productCategories.includes(category)) : [])];
    if (!name || !categories.length) throw Object.assign(new Error("Enter a brand name and choose at least one product type"), { status: 422 });

    await connectDB();
    const brand = await Brand.findById(id).maxTimeMS(5000);
    if (!brand || !brand.active) throw Object.assign(new Error("Brand not found"), { status: 404 });
    const normalizedName = normalizeBrandKey(name);
    const duplicate = await Brand.exists({ _id: { $ne: brand._id }, normalizedName }).maxTimeMS(5000);
    if (duplicate) throw Object.assign(new Error("Another brand already uses this name"), { status: 409 });
    const previousName = brand.name;
    brand.name = name;
    brand.normalizedName = normalizedName;
    brand.categories = categories;
    await brand.save();
    if (previousName !== name) await Phone.updateMany({ brand: previousName }, { $set: { brand: name } }).maxTimeMS(10000);
    revalidateTag("phones", "max");
    revalidatePath("/dashboard/brands");
    revalidatePath("/dashboard/phones");
    revalidatePath("/phones");
    return ok(brand);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    await enforceRateLimit(request, { scope: "brands-write", limit: 30, windowMs: 15 * 60_000 });
    await requireDashboardUser();
    const { id } = await params;
    validId(id);
    await connectDB();
    const brand = await Brand.findOneAndUpdate({ _id: id, active: true }, { $set: { active: false } }, { new: true }).maxTimeMS(5000);
    if (!brand) throw Object.assign(new Error("Brand not found"), { status: 404 });
    revalidatePath("/dashboard/brands");
    return ok({ deleted: true, id });
  } catch (error) {
    return handleError(error);
  }
}
