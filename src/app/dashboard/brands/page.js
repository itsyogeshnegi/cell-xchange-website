import { productCategories } from "@/lib/brands";
import { getBrandCatalog } from "@/services/brandService";
import { getBrandStats } from "@/services/phoneService";

export const metadata = { title: "Brands" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const [brandsByCategory, brandCounts] = await Promise.all([getBrandCatalog(), getBrandStats()]);
  const brandNames = [...new Set(productCategories.flatMap((category) => brandsByCategory[category] || []))].sort();
  return (
    <div className="mx-auto max-w-5xl">
      <p className="eyebrow text-[#718078]">Catalog</p>
      <h1 className="display mt-2 text-4xl font-black">Brands</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brandNames.map((name) => (
          <div key={name} className="rounded-[20px] border border-[#e1e4e1] bg-white p-6">
            <p className="text-lg font-black">{name}</p>
            <p className="mt-2 text-xs text-[#7b837d]">{(brandCounts[name] || 0)} active listing{(brandCounts[name] || 0) === 1 ? "" : "s"}</p>
            <p className="mt-3 text-[10px] text-[#939a95]">{productCategories.filter((category) => brandsByCategory[category]?.includes(name)).join(" · ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
