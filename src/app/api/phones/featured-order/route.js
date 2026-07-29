import mongoose from "mongoose";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/db";
import { handleError, ok, requireAdmin } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import Phone from "@/models/Phone";

export async function PUT(request) {
  try {
    await enforceRateLimit(request, { scope: "featured-order", limit: 20, windowMs: 15 * 60_000 });
    await requireAdmin();
    if (Number(request.headers.get("content-length") || 0) > 20_000) throw Object.assign(new Error("Request is too large"), { status: 413 });
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? body.ids : [];
    if (!ids.length || ids.length > 100 || new Set(ids).size !== ids.length || ids.some((id) => !mongoose.isValidObjectId(id))) {
      throw Object.assign(new Error("Featured product order is invalid"), { status: 422 });
    }
    await connectDB();
    const featuredCount = await Phone.countDocuments({ _id: { $in: ids }, featured: true }).maxTimeMS(5000);
    if (featuredCount !== ids.length) throw Object.assign(new Error("One or more featured products are no longer available"), { status: 409 });
    await Phone.bulkWrite(ids.map((id, index) => ({
      updateOne: { filter: { _id: id, featured: true }, update: { $set: { featuredPriority: index + 1 } } },
    })), { ordered: true });
    revalidateTag("phones", "max");
    return ok({ ids });
  } catch (error) {
    return handleError(error);
  }
}
