import BrandManager from "@/components/admin/BrandManager";
import { getBrandsForAdmin } from "@/services/brandService";
import { getBrandStats } from "@/services/phoneService";

export const metadata = { title: "Brands" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const [brands, brandCounts] = await Promise.all([getBrandsForAdmin(), getBrandStats()]);
  return <div className="mx-auto max-w-5xl">
    <p className="eyebrow text-[#718078]">Catalog</p>
    <h1 className="display mt-2 text-4xl font-black">Brands</h1>
    <p className="mt-2 text-sm text-[#747c76]">Add, rename, categorize, or remove brands used by the product editor.</p>
    <BrandManager initialBrands={brands} brandCounts={brandCounts}/>
  </div>;
}
