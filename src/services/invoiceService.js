import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";

const serialize = (value) => JSON.parse(JSON.stringify(value));

export async function getInvoiceHistory(page = 1, limit = 10) {
  const safeLimit = Math.min(10, Math.max(1, limit));
  const safePage = Math.max(1, page);
  if (!process.env.MONGODB_URI) return { items: [], pagination: { page: 1, limit: safeLimit, total: 0, totalPages: 1 } };
  await connectDB();
  const [items, total] = await Promise.all([
    Invoice.find({})
      .select("invoiceNumber invoiceDate customerName customerMobile paymentMode model amount image createdAt")
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean()
      .maxTimeMS(5000),
    Invoice.countDocuments({}).maxTimeMS(5000),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  return serialize({ items, pagination: { page: Math.min(safePage, totalPages), limit: safeLimit, total, totalPages } });
}
