import mongoose from "mongoose";
import { productCategories } from "@/lib/brands";

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  normalizedName: { type: String, required: true, unique: true, lowercase: true, trim: true },
  categories: [{ type: String, enum: productCategories, required: true }],
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

brandSchema.index({ active: 1, name: 1 });

export default mongoose.models.Brand || mongoose.model("Brand", brandSchema);

