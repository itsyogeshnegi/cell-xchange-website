import dynamicImport from "next/dynamic";
import { FormSkeleton } from "@/components/ui/Skeletons";
import { getBrandCatalog } from "@/services/brandService";

const PhoneForm = dynamicImport(() => import("@/components/admin/PhoneForm"), { loading: () => <FormSkeleton /> });

export const metadata = { title: "Add product" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const brandsByCategory = await getBrandCatalog();
  return <div className="mx-auto max-w-6xl"><PhoneForm brandsByCategory={brandsByCategory}/></div>;
}
