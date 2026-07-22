import mongoose from "mongoose";

const storeSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: "primary" },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
  phoneDisplay: { type: String, required: true, trim: true, maxlength: 30 },
  hours: { type: String, required: true, trim: true, maxlength: 80 },
}, { timestamps: true });

export default mongoose.models.StoreSettings || mongoose.model("StoreSettings", storeSettingsSchema);
