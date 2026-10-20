import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, MapPin, ShieldCheck } from "lucide-react";
import PhoneGallery from "@/components/phones/PhoneGallery";
import PhoneCard from "@/components/phones/PhoneCard";
import { phones } from "@/lib/demo-data";
import { getPhone, getPhones } from "@/services/phoneService";
import { getStoreProfile } from "@/services/settingsService";
import { formatPrice } from "@/utils/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const phone = await getPhone(id);
  return phone ? { title: `${phone.brand} ${phone.model}`, description: phone.description } : { title: "Phone not found" };
}

export async function generateStaticParams() {
  return phones.map((phone) => ({ id: phone._id }));
}

function WhatsAppIcon({ className = "h-4 w-4" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className={`${className} fill-current`}>
      <path d="M16.04 3C8.84 3 3 8.73 3 15.8c0 2.25.6 4.45 1.74 6.37L3 28.5l6.58-1.69a13.18 13.18 0 0 0 6.46 1.65C23.24 28.46 29 22.74 29 15.8 29 8.73 23.24 3 16.04 3Zm0 23.3c-2.02 0-4-.53-5.72-1.54l-.41-.24-3.91 1 1.04-3.73-.27-.42a10.52 10.52 0 0 1-1.63-5.57c0-5.87 4.88-10.64 10.9-10.64 6 0 10.82 4.77 10.82 10.64 0 5.8-4.82 10.5-10.82 10.5Zm5.98-7.86c-.33-.16-1.95-.94-2.25-1.05-.3-.1-.52-.16-.74.16-.22.32-.85 1.05-1.04 1.26-.19.22-.38.24-.71.08-.33-.16-1.39-.5-2.65-1.6a9.83 9.83 0 0 1-1.84-2.24c-.19-.32-.02-.5.14-.66.15-.14.33-.37.49-.56.17-.18.22-.32.33-.53.11-.21.05-.4-.03-.56-.08-.16-.74-1.74-1.01-2.38-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.88.4-.3.32-1.15 1.1-1.15 2.67 0 1.58 1.18 3.1 1.34 3.31.17.21 2.32 3.46 5.62 4.85.79.33 1.4.53 1.88.68.79.24 1.5.21 2.07.13.63-.09 1.95-.78 2.22-1.53.28-.75.28-1.39.2-1.53-.08-.13-.3-.21-.63-.37Z" />
    </svg>
  );
}

export default async function PhoneDetails({ params }) {
  const store = await getStoreProfile();
  const { id } = await params;
  const phone = await getPhone(id);
  if (!phone) notFound();

  const related = (await getPhones({ brand: phone.brand }, 4)).filter((item) => item._id !== phone._id).slice(0, 3);
  const details = [
    ["Brand", phone.brand],
    ["Model", phone.model],
    ["Country", phone.country || "Not specified"],
    ["RAM / Storage", [phone.ram, phone.storage].filter(Boolean).join(" / ")],
    ["Warranty status", phone.warrantyStatus || "Not specified"],
    ["Battery health", phone.battery || "Not specified"],
    ["Condition", phone.condition],
    ["Accessories", phone.accessories?.length ? phone.accessories.join(", ") : "Not included"],
    ["Price", formatPrice(phone.price)],
    ["Description", phone.description || "No description provided."],
  ];

  const status = phone.status || (phone.stock > 0 ? "Available" : "Sold");
  const available = status === "Available";

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://cellxchange.in").replace(/\/$/, "");
  const productUrl = `${baseUrl}/phones/${phone._id}`;

  const batteryText = phone.battery
    ? `${phone.battery}${/^\d+$/.test(phone.battery.trim()) ? "%" : ""}`
    : null;

  const messageLines = [
    `Hi ${store.name}, I am interested in this device:`,
    "",
    `*Device:* ${phone.brand} ${phone.model}`,
    `*Price:* ${formatPrice(phone.price)}`,
    phone.condition ? `*Condition:* ${phone.condition}` : null,
    (phone.storage || phone.ram) ? `*Storage / RAM:* ${[phone.ram, phone.storage].filter(Boolean).join(" / ")}` : null,
    phone.color ? `*Colour:* ${phone.color}` : null,
    batteryText ? `*Battery Health:* ${batteryText}` : null,
    (phone.warrantyStatus && phone.warrantyStatus !== "Not specified") ? `*Warranty:* ${phone.warrantyStatus}` : null,
    phone.accessories?.length ? `*Accessories:* ${phone.accessories.join(", ")}` : null,
    `*Status:* ${status}`,
    "",
    `*Product Link:*`,
    productUrl,
    "",
    "Is this phone currently available?",
  ].filter(Boolean).join("\n");

  const phoneDigits = store.phoneE164.replace(/\D/g, "");
  const enquiryUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(messageLines)}`;

  return (
    <>
      <section className="container-shell py-8 sm:py-14">
        <Link href="/phones" className="mb-9 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#686b71]">
          <ArrowLeft size={14} /> Back to all phones
        </Link>
        <div className="grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <PhoneGallery phone={phone} />
          <div className="lg:py-7">
            <span className="eyebrow text-[#777a80]">{phone.brand}</span>
            <h1 className="display mt-4 text-5xl font-semibold sm:text-6xl">{phone.model}</h1>
            {phone.description && <p className="mt-6 max-w-xl text-sm leading-7 text-[#62656b]">{phone.description}</p>}
            <div className="mt-9">
              <span className="text-3xl font-semibold tracking-[-.04em]">{formatPrice(phone.price)}</span>
            </div>
            <div
              className={`mt-5 inline-flex items-center gap-2 border px-3 py-2 text-[10px] font-bold uppercase tracking-[.1em] ${
                available ? "border-[#b9d9c3] bg-[#f0f8f2] text-[#24613d]" : "border-[#e5cccc] bg-[#faf2f2] text-[#8a3838]"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${available ? "bg-[#37a35f]" : "bg-[#b85454]"}`} />
              {status}
            </div>

            <a
              href={enquiryUrl}
              target="_blank"
              rel="noreferrer"
              className="group mt-9 flex w-full items-center justify-center gap-2.5 bg-black px-6 py-4 text-xs font-bold uppercase tracking-[.12em] text-white transition hover:bg-[#20b83f]"
            >
              <WhatsAppIcon className="h-4.5 w-4.5 text-[#25D366] transition-colors group-hover:text-white" />
              <span>Ask about this phone on WhatsApp</span>
            </a>

            <div className="mt-5 grid grid-cols-2 border border-[#e1e2df]">
              <div className="flex gap-3 border-r border-[#e1e2df] p-4">
                <ShieldCheck size={18} />
                <span className="text-xs font-semibold leading-5">Condition<br />verified</span>
              </div>
              <div className="flex gap-3 p-4">
                <MapPin size={18} />
                <span className="text-xs font-semibold leading-5">Collect in<br />Vasant Kunj</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e1e2df] bg-[#f6f6f3] py-20">
        <div className="container-shell grid gap-12 lg:grid-cols-[.65fr_1.35fr]">
          <div>
            <p className="eyebrow text-[#777a80]">Product details</p>
            <h2 className="display mt-4 text-4xl font-semibold">Everything you<br />need to know.</h2>
          </div>
          <dl className="grid sm:grid-cols-2">
            {details.map(([name, value]) => (
              <div key={name} className={`border-b border-[#dfe0dd] py-5 sm:mr-10 ${name === "Description" ? "sm:col-span-2" : ""}`}>
                <dt className="text-[9px] font-bold uppercase tracking-[.14em] text-[#8b8e93]">{name}</dt>
                <dd className={`mt-2 text-sm font-semibold ${name === "Description" ? "max-w-3xl leading-7" : ""}`}>{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-shell py-20">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="eyebrow text-[#777a80]">Continue browsing</p>
              <h2 className="display mt-4 text-4xl font-semibold">You may also consider.</h2>
            </div>
            <Check className="text-[#777a80]" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <PhoneCard key={item._id} phone={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
