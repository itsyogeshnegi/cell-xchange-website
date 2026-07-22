import { cache } from "react";
import { connectDB } from "@/lib/db";
import { createStoreProfile, store } from "@/lib/store";
import StoreSettings from "@/models/StoreSettings";

export const getStoreProfile = cache(async () => {
  if (!process.env.MONGODB_URI) return store;
  try {
    await connectDB();
    const saved = await StoreSettings.findOne({ key: "primary" }).select("name email phoneDisplay hours -_id").lean().maxTimeMS(5000);
    return createStoreProfile(saved || {});
  } catch (error) {
    console.error("Could not load store settings", error);
    return store;
  }
});
