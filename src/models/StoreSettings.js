import mongoose from "mongoose";
import { editableStoreFields } from "@/lib/store";

const textFields = Object.fromEntries(editableStoreFields.map((field) => [field, { type: String, trim: true, maxlength: 2000 }]));
const storeSettingsSchema = new mongoose.Schema({
  ...textFields,
  key: { type: String, unique: true, default: "primary" },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
  phoneDisplay: { type: String, required: true, trim: true, maxlength: 30 },
  hours: { type: String, required: true, trim: true, maxlength: 80 },
  offerBarEnabled: { type: Boolean, default: true },
  showInstagram: { type: Boolean, default: true },
  showYoutube: { type: Boolean, default: true },
  showWhatsapp: { type: Boolean, default: true },
  brandLogo: {
    url: { type: String, trim: true },
    publicId: { type: String, trim: true },
  },
  heroImage: {
    url: { type: String, trim: true },
    publicId: { type: String, trim: true },
  },
  heroImages: [{
    url: { type: String, required: true, trim: true },
    publicId: { type: String, trim: true, default: "" },
    _id: false,
  }],
}, { timestamps: true });

export default mongoose.models.StoreSettings || mongoose.model("StoreSettings", storeSettingsSchema);
