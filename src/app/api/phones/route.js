import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/db";
import { handleError, ok, requireAdmin } from "@/lib/api";
import { deleteImages, uploadImage } from "@/lib/cloudinary";
import { phones as demoPhones } from "@/lib/demo-data";
import { enforceRateLimit } from "@/lib/rate-limit";
import { parsePhoneForm, publicPhoneFields, safeString, validateImageFiles } from "@/lib/phone-input";
import Phone from "@/models/Phone";

function cached(data) {
  const response = ok(data);
  response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=300");
  return response;
}

export async function GET(request) {
  try {
    await enforceRateLimit(request, { scope: "phones-read", limit: 120 });
    const { searchParams } = new URL(request.url);
    const page = Math.min(500, Math.max(1, Number(searchParams.get("page")) || 1));
    const limit = Math.min(24, Math.max(1, Number(searchParams.get("limit")) || 12));
    const q = safeString(searchParams.get("q"));
    const brand = safeString(searchParams.get("brand"));
    const storage = safeString(searchParams.get("storage"));

    if (!process.env.MONGODB_URI) {
      let items = demoPhones.filter((phone) => (!q || `${phone.brand} ${phone.model}`.toLowerCase().includes(q.toLowerCase())) && (!brand || phone.brand === brand) && (!storage || phone.storage === storage));
      const total = items.length;
      items = items.slice((page - 1) * limit, page * limit);
      return cached({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
    }

    await connectDB();
    const filter = {};
    if (q) filter.$text = { $search: q };
    if (brand) filter.brand = brand;
    if (storage) filter.storage = storage;
    const sortName = searchParams.get("sort");
    const sort = sortName === "price-asc" ? { price: 1, _id: 1 } : sortName === "price-desc" ? { price: -1, _id: -1 } : { createdAt: -1, _id: -1 };
    const [items, total] = await Promise.all([
      Phone.find(filter).select(publicPhoneFields).sort(sort).skip((page - 1) * limit).limit(limit).lean().maxTimeMS(5000),
      Phone.countDocuments(filter).maxTimeMS(5000),
    ]);
    return cached({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) { return handleError(error); }
}

export async function POST(request) {
  let images = [];
  try {
    await enforceRateLimit(request, { scope: "phones-write", limit: 30 });
    await requireAdmin();
    if (Number(request.headers.get("content-length") || 0) > 70 * 1024 * 1024) throw Object.assign(new Error("Upload is too large"), { status: 413 });
    const form = await request.formData();
    const files = form.getAll("images").filter((file) => file?.size);
    validateImageFiles(files);
    images = await Promise.all(files.map(uploadImage));
    await connectDB();
    const phone = await Phone.create({ ...parsePhoneForm(form), images });
    revalidateTag("phones", "max");
    return ok(phone, 201);
  } catch (error) {
    if (images.length) await deleteImages(images).catch(() => {});
    return handleError(error);
  }
}
