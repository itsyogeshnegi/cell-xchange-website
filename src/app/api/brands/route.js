import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { handleError, ok, requireDashboardUser } from "@/lib/api";
import { normalizeBrandKey, normalizeBrandName, productCategories } from "@/lib/brands";
import { enforceRateLimit } from "@/lib/rate-limit";
import Brand from "@/models/Brand";

function readBrand(body) {
  const name = normalizeBrandName(body.name);
  const categories = [...new Set(Array.isArray(body.categories) ? body.categories.filter((category) => productCategories.includes(category)) : [])];
  if (!name || !categories.length) throw Object.assign(new Error("Enter a brand name and choose at least one product type"), { status: 422 });
  return { name, categories };
}

export async function POST(request) {
  try {
    await enforceRateLimit(request, { scope: "brands-write", limit: 30, windowMs: 15 * 60_000 });
    await requireDashboardUser();
    if (Number(request.headers.get("content-length") || 0) > 10_000) throw Object.assign(new Error("Request is too large"), { status: 413 });
    const { name, categories } = readBrand(await request.json());
    await connectDB();
    const normalizedName = normalizeBrandKey(name);
    const existing = await Brand.findOne({ normalizedName }).maxTimeMS(5000);
    if (existing?.active) throw Object.assign(new Error("This brand already exists"), { status: 409 });
    const brand = existing || new Brand({ normalizedName });
    brand.name = name;
    brand.categories = categories;
    brand.active = true;
    await brand.save();
    revalidatePath("/dashboard/brands");
    return ok(brand, 201);
  } catch (error) {
    return handleError(error);
  }
}
