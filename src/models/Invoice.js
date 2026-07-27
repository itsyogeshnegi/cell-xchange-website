import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
}, { _id: false });

const storeSnapshotSchema = new mongoose.Schema({
  name: String,
  phoneDisplay: String,
  email: String,
  addressLine1: String,
  addressLine2: String,
  logoUrl: String,
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 40 },
  invoiceDate: { type: Date, required: true, index: true },
  customerName: { type: String, required: true, trim: true, maxlength: 120 },
  customerMobile: { type: String, required: true, trim: true, maxlength: 20 },
  paymentMode: { type: String, required: true, enum: ["Cash", "UPI", "Card", "Bank Transfer", "Other"] },
  model: { type: String, required: true, trim: true, maxlength: 160 },
  imei: { type: String, trim: true, match: [/^\d{15}$/, "IMEI must be exactly 15 digits"] },
  colorDetails: { type: String, trim: true, maxlength: 240, default: "" },
  ramCapacity: { type: String, trim: true, maxlength: 120, default: "" },
  description: { type: String, trim: true, maxlength: 1000, default: "" },
  amount: { type: Number, required: true, min: 0 },
  amountInWords: { type: String, required: true, trim: true, maxlength: 500 },
  terms: { type: [String], default: [] },
  image: { type: imageSchema, required: true },
  store: { type: storeSnapshotSchema, required: true },
}, { timestamps: true });

invoiceSchema.index({ createdAt: -1 });
invoiceSchema.index({ customerMobile: 1, createdAt: -1 });

export default mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
