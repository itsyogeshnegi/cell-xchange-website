import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { handleError, ok, requireAdmin } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createStoreProfile } from "@/lib/store";
import StoreSettings from "@/models/StoreSettings";

const clean = (value, max) => String(value || "").trim().slice(0, max);

export async function PUT(request) {
  try {
    await enforceRateLimit(request, { scope: "settings-write", limit: 20 });
    await requireAdmin();
    const body = await request.json();
    const values = {
      name: clean(body.name, 80), email: clean(body.email, 160).toLowerCase(),
      phoneDisplay: clean(body.phoneDisplay, 30), hours: clean(body.hours, 80),
    };
    if (!values.name || !values.email || !values.phoneDisplay || !values.hours) throw Object.assign(new Error("All store profile fields are required"), { status: 422 });
    if (!/^\S+@\S+\.\S+$/.test(values.email)) throw Object.assign(new Error("Enter a valid contact email"), { status: 422 });
    if (values.phoneDisplay.replace(/\D/g, "").length < 10) throw Object.assign(new Error("Enter a valid phone number"), { status: 422 });
    await connectDB();
    const settings = await StoreSettings.findOneAndUpdate({ key: "primary" }, { $set: values, $setOnInsert: { key: "primary" } }, { new: true, upsert: true, runValidators: true }).lean();
    revalidatePath("/", "layout");
    revalidatePath("/dashboard/settings");
    return ok(createStoreProfile(settings));
  } catch (error) { return handleError(error); }
}
