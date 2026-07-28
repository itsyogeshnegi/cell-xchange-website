import dynamicImport from "next/dynamic";
import { getPhonePage } from "@/services/phoneService";
import { TableSkeleton } from "@/components/ui/Skeletons";

const PhonesTable = dynamicImport(() => import("@/components/admin/PhonesTable"), { loading: () => <TableSkeleton /> });

export const metadata = { title: "Inventory" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const initialPage = await getPhonePage({ limit: 10, admin: true });
  return <div className="mx-auto max-w-7xl"><PhonesTable initialPage={initialPage}/></div>;
}
