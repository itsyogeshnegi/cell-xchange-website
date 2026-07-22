import dynamicImport from "next/dynamic";
import { getPhoneFacets, getPhonePage } from "@/services/phoneService";
import { PhoneGridSkeleton } from "@/components/ui/Skeletons";

const Catalog = dynamicImport(() => import("@/components/phones/Catalog"), { loading: () => <PhoneGridSkeleton /> });

export const metadata = { title: "Available phones", description: "Browse and filter the current smartphone inventory at cell.xchange, Vasant Kunj." };
export const dynamic = "force-dynamic";

export default async function PhonesPage() {
  const [initialPage, facets] = await Promise.all([getPhonePage({ limit: 12 }), getPhoneFacets()]);
  return <section className="container-shell py-16 sm:py-20"><div className="mb-12 max-w-2xl"><p className="eyebrow text-[#718078]">Current collection</p><h1 className="display mt-3 text-5xl font-black sm:text-7xl">A better phone<br/>starts here.</h1><p className="mt-5 text-sm leading-6 text-[#69716c]">Compare verified devices and find the exact fit for your day-to-day.</p></div><Catalog initialPage={initialPage} facets={facets}/></section>;
}
