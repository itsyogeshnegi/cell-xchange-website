import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { handleError, ok, requireAdmin } from "@/lib/api";
import { deleteImages, uploadInvoiceImage } from "@/lib/cloudinary";
import { invoiceTerms } from "@/lib/invoice";
import { enforceRateLimit } from "@/lib/rate-limit";
import Invoice from "@/models/Invoice";
import { getStoreProfile } from "@/services/settingsService";
import { amountInWords } from "@/utils/amount-in-words";

const clean = (value, max = 160) => String(value || "").trim().slice(0, max);
const serialize = (value) => JSON.parse(JSON.stringify(value));

export async function GET(request) {
  try {
    await enforceRateLimit(request, { scope: "invoices-read", limit: 120 });
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const limit = 10;
    const requestedPage = Math.max(1, Number(searchParams.get("page")) || 1);
    await connectDB();
    const total = await Invoice.countDocuments({}).maxTimeMS(5000);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, totalPages);
    const items = await Invoice.find({})
      .select("invoiceNumber invoiceDate customerName customerMobile paymentMode model amount amountInWords image store createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .maxTimeMS(5000);
    return ok(serialize({ items, pagination: { page, limit, total, totalPages } }));
  } catch (error) { return handleError(error); }
}

export async function POST(request) {
  let invoiceImage;
  try {
    await enforceRateLimit(request, { scope: "invoices-write", limit: 30 });
    await requireAdmin();
    if (Number(request.headers.get("content-length") || 0) > 14 * 1024 * 1024) throw Object.assign(new Error("Invoice upload is too large"), { status: 413 });
    const form = await request.formData();
    const image = form.get("invoiceImage");
    if (!image?.size || !["image/png", "image/jpeg", "image/webp"].includes(image.type) || image.size > 10 * 1024 * 1024) {
      throw Object.assign(new Error("A valid invoice image under 10MB is required"), { status: 422 });
    }
    const values = {
      invoiceNumber: clean(form.get("invoiceNumber"), 40).toUpperCase(),
      invoiceDate: new Date(clean(form.get("invoiceDate"), 30)),
      customerName: clean(form.get("customerName"), 120),
      customerMobile: clean(form.get("customerMobile"), 20),
      paymentMode: clean(form.get("paymentMode"), 30),
      model: clean(form.get("model"), 160),
      imei: clean(form.get("imei"), 20) || undefined,
      colorDetails: clean(form.get("colorDetails"), 240),
      ramCapacity: clean(form.get("ramCapacity"), 120),
      description: clean(form.get("description"), 1000),
      amount: Number(form.get("amount")),
    };
    if (!/^[A-Z0-9/_-]{2,40}$/.test(values.invoiceNumber)) throw Object.assign(new Error("Enter a valid invoice number"), { status: 422 });
    if (Number.isNaN(values.invoiceDate.getTime())) throw Object.assign(new Error("Enter a valid invoice date"), { status: 422 });
    if (!values.customerName || values.customerMobile.replace(/\D/g, "").length !== 10 || !values.model || !Number.isFinite(values.amount) || values.amount < 0) {
      throw Object.assign(new Error("Complete all required invoice fields"), { status: 422 });
    }
    if (values.imei && !/^\d{15}$/.test(values.imei)) throw Object.assign(new Error("IMEI must be exactly 15 digits"), { status: 422 });
    const store = await getStoreProfile();
    invoiceImage = await uploadInvoiceImage(image);
    await connectDB();
    const invoice = await Invoice.create({
      ...values,
      amountInWords: amountInWords(values.amount),
      terms: invoiceTerms,
      image: invoiceImage,
      store: {
        name: store.name,
        phoneDisplay: store.phoneDisplay,
        email: store.email,
        addressLine1: store.addressLine1,
        addressLine2: store.addressLine2,
        logoUrl: store.brandLogo?.url || "",
      },
    });
    revalidatePath("/dashboard/invoices");
    return ok(serialize(invoice), 201);
  } catch (error) {
    if (invoiceImage) await deleteImages([invoiceImage]).catch(() => {});
    return handleError(error);
  }
}

export async function DELETE(request) {
  try {
    await enforceRateLimit(request, { scope: "invoices-delete", limit: 30 });
    await requireAdmin();
    const id = new URL(request.url).searchParams.get("id");
    if (!mongoose.isValidObjectId(id)) throw Object.assign(new Error("Invalid invoice"), { status: 422 });
    await connectDB();
    const invoice = await Invoice.findById(id).select("image").lean().maxTimeMS(5000);
    if (!invoice) throw Object.assign(new Error("Invoice not found"), { status: 404 });
    await Invoice.deleteOne({ _id: id }).maxTimeMS(5000);
    await deleteImages([invoice.image]).catch(() => {});
    revalidatePath("/dashboard/invoices");
    return ok({ id });
  } catch (error) {
    return handleError(error);
  }
}
