import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({ url: { type: String, required: true }, publicId: { type: String, required: true } }, { _id: false });
const phoneSchema = new mongoose.Schema({
  category: { type: String, enum: ["Phone", "Laptop", "Smartwatch"], default: "Phone", index: true },
  brand: { type: String, required: true, trim: true, index: true },
  model: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: "", maxlength: 4000 },
  price: { type: Number, required: true, min: 0 }, discount: { type: Number, default: 0, min: 0, max: 95 },
  color: { type: String, required: true }, storage: { type: String, required: true, index: true }, ram: { type: String, required: true },
  battery: String, processor: String, display: String, camera: String,
  condition: { type: String, enum: ["New", "Excellent", "Good", "Fair"], default: "New" },
  imei: { type: String, sparse: true }, stock: { type: Number, required: true, min: 0, default: 0 },
  featured: { type: Boolean, default: false }, latest: { type: Boolean, default: false }, visible: { type: Boolean, default: true, index: true }, images: { type: [imageSchema], validate: { validator(items) { return !this.isNew || items.length >= 2; }, message: "At least two images are required" } },
}, { timestamps: true });
phoneSchema.index({ brand: "text", model: "text", description: "text" });
phoneSchema.index({ brand: 1, storage: 1, createdAt: -1 });
phoneSchema.index({ price: 1, _id: 1 });
phoneSchema.index({ featured: 1, createdAt: -1 });
phoneSchema.index({ latest: 1, createdAt: -1 });
phoneSchema.index({ stock: 1 });
export default mongoose.models.Phone || mongoose.model("Phone", phoneSchema);
