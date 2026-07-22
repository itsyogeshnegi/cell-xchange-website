import dynamicImport from "next/dynamic";
import { getPhoneFacets, getPhonePage } from "@/services/phoneService";
import { TableSkeleton } from "@/components/ui/Skeletons";

const PhonesTable = dynamicImport(() => import("@/components/admin/PhonesTable"), { loading: () => <TableSkeleton /> });

export const metadata = { title: "Phones" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const [initialPage, facets] = await Promise.all([getPhonePage({ limit: 10 }), getPhoneFacets()]);
  return <div className="mx-auto max-w-7xl"><PhonesTable initialPage={initialPage} facets={facets}/></div>;
}
