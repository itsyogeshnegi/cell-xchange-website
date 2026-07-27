import InvoiceWorkspace from "@/components/admin/InvoiceWorkspace";
import { getInvoiceHistory } from "@/services/invoiceService";
import { getStoreProfile } from "@/services/settingsService";

export const metadata = { title: "Invoices" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const [profile, history] = await Promise.all([getStoreProfile(), getInvoiceHistory()]);
  const now = new Date();
  const invoiceDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const suggestedNumber = `CX-${invoiceDate.replaceAll("-", "")}-${String(now.getTime()).slice(-6)}`;
  return <div className="mx-auto max-w-[1500px]"><p className="eyebrow text-[#718078]">Sales desk</p><h1 className="display mt-2 text-4xl font-black">Invoices</h1><p className="mt-2 text-sm text-[#747c76]">Generate customer invoices, export PDF copies, and access the Cloudinary-backed history.</p><InvoiceWorkspace initialHistory={history.items} initialPagination={history.pagination} invoiceDate={invoiceDate} profile={profile} suggestedNumber={suggestedNumber}/></div>;
}
