"use client";

import axios from "axios";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, Download, ExternalLink, FileDown, LoaderCircle, Plus, ReceiptText, Trash2, X } from "lucide-react";
import { amountInWords } from "@/utils/amount-in-words";
import { formatPrice } from "@/utils/format";

const formatIndianNumber = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!digits) return "";
  const lastThree = digits.slice(-3);
  const leading = digits.slice(0, -3);
  return leading ? `${leading.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${lastThree}` : lastThree;
};

const freshInvoiceNumber = () => {
  const now = new Date();
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("");
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map((part) => String(part).padStart(2, "0")).join("");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");
  const random = globalThis.crypto?.randomUUID?.().slice(0, 4).toUpperCase() || Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CX-${date}-${time}${milliseconds}-${random}`;
};

const freshInvoiceDate = () => {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
};

const initialForm = (invoiceDate, invoiceNumber) => ({
  invoiceNumber,
  invoiceDate,
  customerName: "",
  customerMobile: "",
  paymentMode: "Cash",
  model: "",
  imei: "",
  colorDetails: "",
  ramCapacity: "",
  description: "",
  amount: "",
});

function InvoicePreview({ form, profile, previewRef }) {
  const words = amountInWords(form.amount);
  const terms = String(profile.invoiceTermsText || "").split(/\r?\n/).map((term) => term.trim()).filter(Boolean);
  return <div ref={previewRef} className="mx-auto aspect-[210/297] w-full overflow-hidden bg-white text-black" style={{ fontFamily: "Arial, sans-serif" }}>
    <div className="flex h-full flex-col border-2 border-black p-[3.2%]">
      <header className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)] gap-[2%] border-b-2 border-black pb-[1.5%]">
        <div className="flex min-w-0 items-center gap-5">
          {profile.brandLogo?.url ? <div className="flex h-[clamp(34px,7vw,80px)] max-w-[360px] items-center overflow-visible">
            {/* A native image gives html2canvas a stable box and prevents Next image sizing from clipping wide logos. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.brandLogo.url}
              crossOrigin="anonymous"
              alt={`${profile.name} logo`}
              className="block h-auto w-auto"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          </div> : <><span className="grid size-[clamp(30px,5vw,56px)] place-items-center rounded-lg bg-black text-[clamp(6px,1vw,12px)] font-black text-white">c.x</span><h2 className="text-[clamp(14px,3vw,30px)] font-black">{profile.name}</h2></>}
        </div>
        <div className="min-w-0 self-center text-right text-[clamp(5px,.95vw,10px)] leading-[1.35] [overflow-wrap:anywhere]">
          {profile.showInvoiceHeader && profile.invoiceHeader && <p className="mb-[2%] text-[clamp(8px,1.5vw,16px)] font-black uppercase tracking-[.08em]">{profile.invoiceHeader}</p>}
          <p className="font-bold">{profile.addressLine1}</p>
          <p>{profile.addressLine2}</p>
          <p>{profile.phoneDisplay} · {profile.email}</p>
        </div>
      </header>

      <section className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)] border-b-2 border-black text-[clamp(5px,1.1vw,12px)]">
        <div className="grid grid-cols-2 gap-x-[3%] border-r-2 border-black p-[2%]">
          <p><strong>M/s.</strong> {form.customerName || "—"}</p>
          <p><strong>Mob.</strong> {form.customerMobile || "—"}</p>
          <p className="col-span-2 mt-2"><strong>Mode of Payment:</strong> {form.paymentMode}</p>
        </div>
        <div className="grid min-w-0 grid-cols-[1.35fr_.65fr]">
          <p className="min-w-0 border-r border-black p-[5%] leading-[1.35]"><strong>Sr. No.</strong><br/><span className="[overflow-wrap:anywhere]">{form.invoiceNumber}</span></p>
          <p className="min-w-0 p-[5%] leading-[1.35]"><strong>Date</strong><br/><span className="whitespace-nowrap text-[.9em]">{form.invoiceDate}</span></p>
        </div>
      </section>

      <section className="grid flex-1 grid-cols-[minmax(0,1fr)_clamp(90px,22%,220px)] text-[clamp(5px,1.1vw,12px)]">
        <div className="border-r-2 border-black">
          <h3 className="border-b border-black bg-[#e8e8e8] px-[2%] py-[1%] text-center text-[clamp(6px,1.2vw,13px)] font-black">DESCRIPTION OF GOODS</h3>
          <dl className="grid grid-cols-[clamp(80px,19%,150px)_minmax(0,1fr)] gap-x-[2%] gap-y-[clamp(3px,1vw,12px)] p-[2.5%] leading-[1.45]">
            <dt className="whitespace-nowrap font-bold">Model</dt><dd className="relative min-w-0 pb-[clamp(3px,.55vw,6px)] leading-[1.25] [overflow-wrap:anywhere] after:absolute after:inset-x-0 after:bottom-0 after:border-b after:border-dotted after:border-black">{form.model || "—"}</dd>
            <dt className="whitespace-nowrap font-bold">IMEI No.</dt><dd className="relative min-w-0 pb-[clamp(3px,.55vw,6px)] leading-[1.25] [overflow-wrap:anywhere] after:absolute after:inset-x-0 after:bottom-0 after:border-b after:border-dotted after:border-black">{form.imei || "—"}</dd>
            <dt className="whitespace-nowrap font-bold">Color / Details</dt><dd className="relative min-w-0 pb-[clamp(3px,.55vw,6px)] leading-[1.25] [overflow-wrap:anywhere] after:absolute after:inset-x-0 after:bottom-0 after:border-b after:border-dotted after:border-black">{form.colorDetails || "—"}</dd>
            <dt className="whitespace-nowrap font-bold">RAM / Capacity</dt><dd className="relative min-w-0 pb-[clamp(3px,.55vw,6px)] leading-[1.25] [overflow-wrap:anywhere] after:absolute after:inset-x-0 after:bottom-0 after:border-b after:border-dotted after:border-black">{form.ramCapacity || "—"}</dd>
            <dt className="whitespace-nowrap font-bold">Description</dt><dd className="relative min-w-0 pb-[clamp(3px,.55vw,6px)] leading-[1.25] [overflow-wrap:anywhere] after:absolute after:inset-x-0 after:bottom-0 after:border-b after:border-dotted after:border-black">{form.description || "—"}</dd>
            <dt className="whitespace-nowrap font-bold">Amount in Words</dt><dd className="relative min-w-0 pb-[clamp(3px,.55vw,6px)] font-semibold leading-[1.25] [overflow-wrap:anywhere] after:absolute after:inset-x-0 after:bottom-0 after:border-b after:border-dotted after:border-black">{words}</dd>
          </dl>
        </div>
        <div className="flex flex-col">
          <h3 className="border-b border-black bg-[#e8e8e8] px-[2%] py-[1%] text-center text-[clamp(6px,1.2vw,13px)] font-black">AMOUNT</h3>
          <div className="flex flex-1 items-start justify-end p-[8%] text-[clamp(10px,2.2vw,24px)] font-black">{formatPrice(form.amount)}</div>
          <div className="flex items-center justify-between border-t-2 border-black p-[5%] text-[clamp(7px,1.5vw,16px)] font-black"><span>Total</span><span>{formatPrice(form.amount)}</span></div>
        </div>
      </section>

      <footer className="grid grid-cols-[minmax(0,1fr)_clamp(110px,27%,260px)] border-t-2 border-black text-[clamp(4px,.85vw,9px)]">
        <div className="p-[2%]"><p className="font-black">Terms &amp; Conditions:</p>{terms.map((term) => <p key={term}>{term}</p>)}<p className="mt-[1%] font-bold">E. & O.E.</p></div>
        <div className="flex flex-col justify-between border-l-2 border-black p-[4%] text-right"><p className="font-bold">For {profile.name}</p><p>Authorized Signatory</p></div>
      </footer>
    </div>
  </div>;
}

export default function InvoiceWorkspace({ initialHistory, initialPagination, invoiceDate, profile, suggestedNumber }) {
  const [form, setForm] = useState(initialForm(invoiceDate, suggestedNumber));
  const [history, setHistory] = useState(initialHistory);
  const [pagination, setPagination] = useState(initialPagination);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const previewRef = useRef(null);
  const editorRef = useRef(null);
  const words = useMemo(() => amountInWords(form.amount), [form.amount]);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const numericUpdate = (name, maxLength) => (event) => setForm((current) => ({ ...current, [name]: event.target.value.replace(/\D/g, "").slice(0, maxLength) }));

  const toggleEditor = () => {
    setEditorOpen((open) => {
      const next = !open;
      if (next) window.setTimeout(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      return next;
    });
  };

  const waitForPreviewImages = async () => {
    const images = Array.from(previewRef.current?.querySelectorAll("img") || []);
    await Promise.all(images.map((image) => {
      if (image.complete && image.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        const finish = () => resolve();
        image.addEventListener("load", finish, { once: true });
        image.addEventListener("error", finish, { once: true });
        window.setTimeout(finish, 5000);
      });
    }));
  };

  const exportCanvasToPdf = async (canvas, invoiceNumber) => {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const scale = Math.min(210 / canvas.width, 297 / canvas.height);
    const width = canvas.width * scale;
    const height = canvas.height * scale;
    pdf.addImage(canvas.toDataURL("image/jpeg", .96), "JPEG", (210 - width) / 2, (297 - height) / 2, width, height, undefined, "FAST");
    pdf.save(`invoice-${invoiceNumber}.pdf`);
  };

  const downloadHistoryPdf = async (invoice) => {
    try {
      const response = await fetch(invoice.image.url);
      const blob = await response.blob();
      const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); });
      const dimensions = await new Promise((resolve, reject) => {
        const image = document.createElement("img");
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = reject;
        image.src = dataUrl;
      });
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const scale = Math.min(210 / dimensions.width, 297 / dimensions.height);
      const width = dimensions.width * scale;
      const height = dimensions.height * scale;
      pdf.addImage(dataUrl, "PNG", (210 - width) / 2, (297 - height) / 2, width, height, undefined, "FAST");
      pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
    } catch { toast.error("Could not download this invoice PDF"); }
  };

  const loadHistoryPage = async (page) => {
    if (historyLoading || page < 1 || page > pagination.totalPages) return;
    setHistoryLoading(true);
    try {
      const { data } = await axios.get("/api/invoices", { params: { page } });
      setHistory(data.data.items);
      setPagination(data.data.pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load invoice history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const deleteInvoice = async () => {
    if (!deleteTarget) return;
    const invoice = deleteTarget;
    setDeletingId(invoice._id);
    try {
      await axios.delete("/api/invoices", { params: { id: invoice._id } });
      const nextPage = history.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      await loadHistoryPage(nextPage);
      setDeleteTarget(null);
      toast.success("Invoice deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete invoice");
    } finally {
      setDeletingId("");
    }
  };

  const generate = async (event) => {
    event.preventDefault();
    if (!form.invoiceNumber || !form.customerName || form.customerMobile.length !== 10 || !form.model || !form.amount) return toast.error("Complete invoice number, customer, mobile, model, and amount");
    if (form.imei && form.imei.length !== 15) return toast.error("IMEI must be exactly 15 digits");
    setGenerating(true);
    try {
      await waitForPreviewImages();
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: false,
        imageTimeout: 10000,
        logging: false,
      });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", .96));
      if (!blob) throw new Error("Could not render invoice");
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      body.append("invoiceImage", blob, `${form.invoiceNumber}.png`);
      await axios.post("/api/invoices", body);
      await loadHistoryPage(1);
      await exportCanvasToPdf(canvas, form.invoiceNumber);
      setForm(initialForm(freshInvoiceDate(), freshInvoiceNumber()));
      toast.success("Invoice saved and PDF exported");
    } catch (error) { toast.error(error.response?.data?.message || error.message || "Could not generate invoice"); }
    finally { setGenerating(false); }
  };

  return <div className="mt-8">
    <section className="rounded-[22px] border border-[#e1e4e1] bg-white p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-base font-black">Invoice history</h2><p className="mt-1 text-xs text-[#7b827d]">{pagination.total} saved invoices · 10 per page</p></div>
        <button type="button" onClick={toggleEditor} aria-expanded={editorOpen} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#173f2c] px-5 py-3 text-xs font-bold text-white sm:w-auto">
          {editorOpen ? <X size={16}/> : <Plus size={16}/>}
          {editorOpen ? "Close invoice form" : "Generate invoice"}
        </button>
      </div>

      <div className="mt-5 hidden max-h-[560px] overflow-auto rounded-xl border border-[#e8eae8] sm:block">
        <table className="w-full min-w-[620px] text-left">
          <thead className="sticky top-0 bg-[#f7f8f6] text-[9px] uppercase tracking-wider text-[#838a85]"><tr><th className="px-4 py-3">Invoice</th><th>Customer</th><th>Image</th><th>Amount</th><th className="pr-4 text-right">Actions</th></tr></thead>
          <tbody>{history.map((invoice) => <tr key={invoice._id} className="border-t border-[#eceeec] text-[10px]">
            <td className="px-4 py-3"><strong className="block break-all">{invoice.invoiceNumber}</strong><span className="mt-1 block text-[#858c87]">{new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}</span></td>
            <td><strong className="block">{invoice.customerName}</strong><span className="mt-1 block text-[#858c87]">{invoice.model}</span></td>
            <td><button type="button" onClick={() => setPreviewInvoice(invoice)} aria-label={`Preview invoice ${invoice.invoiceNumber}`} className="relative block h-12 w-16 overflow-hidden rounded-lg border bg-white transition hover:border-[#173f2c] hover:shadow-md"><Image src={invoice.image.url} fill sizes="64px" className="object-contain" alt={`Invoice ${invoice.invoiceNumber}`}/></button></td>
            <td className="font-bold">{formatPrice(invoice.amount)}</td>
            <td className="pr-4"><div className="flex justify-end gap-1"><a href={invoice.image.url} target="_blank" rel="noreferrer" aria-label="Open invoice image" className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#f0f2f0]"><ExternalLink size={14}/></a><button type="button" onClick={() => downloadHistoryPdf(invoice)} aria-label="Download invoice PDF" className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#f0f2f0]"><Download size={14}/></button><button type="button" disabled={Boolean(deletingId)} onClick={() => setDeleteTarget(invoice)} aria-label={`Delete invoice ${invoice.invoiceNumber}`} className="grid h-9 w-9 place-items-center rounded-full text-[#b33a3a] hover:bg-[#fff0f0] disabled:opacity-40">{deletingId === invoice._id ? <LoaderCircle size={14} className="animate-spin"/> : <Trash2 size={14}/>}</button></div></td>
          </tr>)}</tbody>
        </table>
        {!history.length && <div className="px-5 py-12 text-center text-xs text-[#858c87]">Generated invoices will appear here.</div>}
      </div>

      <div className="mt-5 space-y-3 sm:hidden">
        {history.map((invoice) => <article key={invoice._id} className="rounded-2xl border border-[#e8eae8] p-3">
          <div className="flex items-start gap-3">
            <button type="button" onClick={() => setPreviewInvoice(invoice)} aria-label={`Preview invoice ${invoice.invoiceNumber}`} className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border bg-white"><Image src={invoice.image.url} fill sizes="80px" className="object-contain" alt={`Invoice ${invoice.invoiceNumber}`}/></button>
            <div className="min-w-0 flex-1"><strong className="block break-all text-[11px]">{invoice.invoiceNumber}</strong><p className="mt-1 text-[10px] text-[#747c76]">{invoice.customerName} · {invoice.model}</p><p className="mt-2 text-xs font-black">{formatPrice(invoice.amount)}</p></div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2"><a href={invoice.image.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-[9px] font-bold"><ExternalLink size={13}/>Image</a><button type="button" onClick={() => downloadHistoryPdf(invoice)} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#f0f2f0] px-2 py-2.5 text-[9px] font-bold"><Download size={13}/>PDF</button><button type="button" disabled={Boolean(deletingId)} onClick={() => setDeleteTarget(invoice)} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#fff0f0] px-2 py-2.5 text-[9px] font-bold text-[#b33a3a] disabled:opacity-40">{deletingId === invoice._id ? <LoaderCircle size={13} className="animate-spin"/> : <Trash2 size={13}/>}Delete</button></div>
        </article>)}
        {!history.length && <div className="rounded-2xl border border-dashed px-5 py-10 text-center text-xs text-[#858c87]">Generated invoices will appear here.</div>}
      </div>

      {pagination.total > 0 && <div className="mt-5 flex flex-col gap-3 border-t border-[#eceeec] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center text-[10px] text-[#747c76] sm:text-left">Page {pagination.page} of {pagination.totalPages} · Showing {history.length} invoices</p>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button type="button" disabled={historyLoading || pagination.page <= 1} onClick={() => loadHistoryPage(pagination.page - 1)} className="rounded-full border border-[#dfe3df] px-4 py-2.5 text-[10px] font-bold disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
          <button type="button" disabled={historyLoading || pagination.page >= pagination.totalPages} onClick={() => loadHistoryPage(pagination.page + 1)} className="rounded-full border border-[#dfe3df] px-4 py-2.5 text-[10px] font-bold disabled:cursor-not-allowed disabled:opacity-40">{historyLoading ? "Loading..." : "Next"}</button>
        </div>
      </div>}
    </section>

    {editorOpen && <div ref={editorRef} className="scroll-mt-24">
      <form onSubmit={generate} className="mt-6 rounded-[22px] border border-[#e1e4e1] bg-white p-5 sm:p-7">
        <div className="flex items-center justify-between"><div><h2 className="text-base font-black">Invoice details</h2><p className="mt-1 text-xs text-[#7b827d]">Required fields are marked with *.</p></div><ReceiptText size={22} className="text-[#537361]"/></div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-[11px] font-bold">Sr. / Invoice No. *<input name="invoiceNumber" required readOnly aria-readonly="true" value={form.invoiceNumber} className="input mt-2 cursor-not-allowed bg-[#f2f4f1] uppercase text-[#727a74]"/></label>
          <label className="text-[11px] font-bold">Date *<input name="invoiceDate" type="date" required value={form.invoiceDate} onChange={update} className="input mt-2"/></label>
          <label className="text-[11px] font-bold">Customer / M/s. *<input name="customerName" required value={form.customerName} onChange={update} placeholder="Customer name" className="input mt-2"/></label>
          <label className="text-[11px] font-bold">Mobile *<input name="customerMobile" required inputMode="numeric" value={form.customerMobile} onChange={numericUpdate("customerMobile", 10)} placeholder="10-digit mobile" className="input mt-2"/></label>
          <label className="text-[11px] font-bold">Mode of payment *<select name="paymentMode" value={form.paymentMode} onChange={update} className="input mt-2"><option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option><option>Other</option></select></label>
          <label className="text-[11px] font-bold">Model *<input name="model" required value={form.model} onChange={update} placeholder="Device model" className="input mt-2"/></label>
          <label className="text-[11px] font-bold">IMEI No. <span className="font-normal text-[#909791]">(optional, 15 digits)</span><input name="imei" inputMode="numeric" value={form.imei} onChange={numericUpdate("imei", 15)} placeholder="15-digit IMEI" className="input mt-2"/></label>
          <label className="text-[11px] font-bold">Color / Details<input name="colorDetails" value={form.colorDetails} onChange={update} placeholder="Colour and condition" className="input mt-2"/></label>
          <label className="text-[11px] font-bold">RAM / Capacity<input name="ramCapacity" value={form.ramCapacity} onChange={update} placeholder="8 GB / 256 GB" className="input mt-2"/></label>
          <label className="text-[11px] font-bold">Amount (₹) *<input name="amount" required inputMode="numeric" value={formatIndianNumber(form.amount)} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value.replace(/\D/g, "") }))} placeholder="1,19,900" className="input mt-2"/></label>
          <label className="text-[11px] font-bold sm:col-span-2">Description<textarea name="description" rows="3" value={form.description} onChange={update} placeholder="Additional product or warranty details" className="input mt-2 resize-y"/></label>
          <label className="text-[11px] font-bold sm:col-span-2">Amount in words<input readOnly value={words} className="input mt-2 bg-[#f4f5f3]"/></label>
        </div>
        <button disabled={generating} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#173f2c] px-6 py-3.5 text-xs font-bold text-white disabled:opacity-60 sm:w-auto">{generating ? <LoaderCircle size={16} className="animate-spin"/> : <FileDown size={16}/>}Generate, save & export PDF</button>
      </form>

      <section className="mt-6 rounded-[22px] border border-[#dfe2df] bg-[#eceeeb] p-2.5 sm:p-6">
        <div className="mb-4"><h2 className="text-sm font-black">Live invoice preview</h2><p className="mt-1 text-[10px] text-[#747c76]">Responsive A4 portrait preview · This exact layout is exported and archived.</p></div>
        <div className="mx-auto w-full max-w-[760px] overflow-hidden shadow-xl"><InvoicePreview form={form} profile={profile} previewRef={previewRef}/></div>
      </section>
    </div>}

    {deleteTarget && <div className="fixed inset-0 z-[140] grid place-items-center bg-black/65 p-4 backdrop-blur-[2px]" role="alertdialog" aria-modal="true" aria-labelledby="delete-invoice-title" aria-describedby="delete-invoice-description" onClick={() => !deletingId && setDeleteTarget(null)}>
      <div className="w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#fff0f0] text-[#b82f2f]"><AlertTriangle size={23}/></span>
            <button type="button" disabled={Boolean(deletingId)} onClick={() => setDeleteTarget(null)} aria-label="Close delete confirmation" className="grid h-9 w-9 place-items-center rounded-full bg-[#f1f3f1] disabled:opacity-40"><X size={16}/></button>
          </div>
          <h2 id="delete-invoice-title" className="mt-5 text-xl font-black">Delete this invoice?</h2>
          <p id="delete-invoice-description" className="mt-2 text-xs leading-6 text-[#6f7771]">This permanently removes the invoice record from MongoDB and deletes its archived image from Cloudinary. This action cannot be undone.</p>
          <div className="mt-5 rounded-2xl border border-[#e7e9e7] bg-[#f7f8f6] p-4">
            <p className="break-all text-xs font-black">{deleteTarget.invoiceNumber}</p>
            <p className="mt-1 text-[10px] text-[#747c76]">{deleteTarget.customerName} · {deleteTarget.model}</p>
            <p className="mt-2 text-sm font-black">{formatPrice(deleteTarget.amount)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-[#eceeec] bg-[#fafbfa] p-4 sm:flex sm:justify-end">
          <button type="button" disabled={Boolean(deletingId)} onClick={() => setDeleteTarget(null)} className="rounded-full border border-[#dfe3df] px-5 py-3 text-xs font-bold disabled:opacity-40">Cancel</button>
          <button type="button" disabled={Boolean(deletingId)} onClick={deleteInvoice} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#b82f2f] px-5 py-3 text-xs font-bold text-white disabled:opacity-60">{deletingId ? <LoaderCircle size={15} className="animate-spin"/> : <Trash2 size={15}/>} {deletingId ? "Deleting..." : "Delete invoice"}</button>
        </div>
      </div>
    </div>}

    {previewInvoice && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={`Invoice ${previewInvoice.invoiceNumber} preview`} onClick={() => setPreviewInvoice(null)}>
      <div className="w-full max-w-[800px] overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
          <div className="min-w-0"><h2 className="truncate text-sm font-black">{previewInvoice.invoiceNumber}</h2><p className="mt-0.5 truncate text-[10px] text-[#747c76]">{previewInvoice.customerName} · {previewInvoice.model}</p></div>
          <div className="flex shrink-0 items-center gap-2"><a href={previewInvoice.image.url} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-full border px-3 text-[10px] font-bold"><ExternalLink size={14}/><span className="hidden sm:inline">Open original</span></a><button type="button" onClick={() => setPreviewInvoice(null)} aria-label="Close invoice preview" className="grid h-9 w-9 place-items-center rounded-full bg-[#f0f2f0]"><X size={16}/></button></div>
        </div>
        <div className="relative mx-auto aspect-[210/297] max-h-[calc(100vh-120px)] w-full max-w-[760px] bg-[#eceeeb]"><Image src={previewInvoice.image.url} fill priority sizes="(max-width: 768px) 100vw, 760px" className="object-contain" alt={`Full invoice ${previewInvoice.invoiceNumber}`}/></div>
      </div>
    </div>}
  </div>;
}
