import dynamicImport from "next/dynamic";
import { getPhonePage } from "@/services/phoneService";
import { PhoneGridSkeleton } from "@/components/ui/Skeletons";
import { deviceFilterValues } from "@/lib/device-filters";

const Catalog = dynamicImport(() => import("@/components/phones/Catalog"), { loading: () => <PhoneGridSkeleton /> });

export const metadata = { title: "Available devices", description: "Browse phones, laptops, tablets, smartwatches and accessories available at cell.xchange in Vasant Kunj." };
export const dynamic = "force-dynamic";

export default async function PhonesPage({ searchParams }) {
  const params = await searchParams;
  const initialDevice = deviceFilterValues.includes(params?.device) ? params.device : "All";
  const initialPage = await getPhonePage({ limit: 12, device: initialDevice === "All" ? "" : initialDevice });
  return <section className="container-shell py-16 sm:py-20"><div className="mb-12 max-w-2xl"><p className="eyebrow text-[#718078]">Current collection</p><h1 className="display mt-3 text-5xl font-black sm:text-7xl">Better devices<br/>start here.</h1><p className="mt-5 text-sm leading-6 text-[#69716c]">Compare phones, tablets, smartwatches and accessories to find the right fit for your day-to-day.</p></div><Catalog initialPage={initialPage} initialDevice={initialDevice}/></section>;
}
