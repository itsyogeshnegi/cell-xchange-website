import { notFound } from "next/navigation";
import dynamicImport from "next/dynamic";
import { getPhone } from "@/services/phoneService";
import { FormSkeleton } from "@/components/ui/Skeletons";

const PhoneForm = dynamicImport(() => import("@/components/admin/PhoneForm"), { loading: () => <FormSkeleton /> });

export const metadata = { title: "Edit product" };
export const dynamic = "force-dynamic";
export default async function Page({ params }) {
  const { id } = await params;
  const phone = await getPhone(id, { admin: true });
  if (!phone) notFound();
  return <div className="mx-auto max-w-6xl"><PhoneForm phone={phone}/></div>;
}
