import { brands } from "@/lib/demo-data";
import { getPhones } from "@/services/phoneService";

export const metadata = { title: "Brands" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const phones = await getPhones();
  const brandNames = [...new Set([...brands, ...phones.map((phone) => phone.brand)])];
  return <div className="mx-auto max-w-5xl"><p className="eyebrow text-[#718078]">Catalog</p><h1 className="display mt-2 text-4xl font-black">Brands</h1><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{brandNames.map(name=><div key={name} className="rounded-[20px] border border-[#e1e4e1] bg-white p-6"><p className="text-lg font-black">{name}</p><p className="mt-2 text-xs text-[#7b837d]">{phones.filter(x=>x.brand===name).length} active listing</p></div>)}</div></div>;
}
