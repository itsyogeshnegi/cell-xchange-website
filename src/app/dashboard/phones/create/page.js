import dynamicImport from "next/dynamic";
import { FormSkeleton } from "@/components/ui/Skeletons";

const PhoneForm = dynamicImport(() => import("@/components/admin/PhoneForm"), { loading: () => <FormSkeleton /> });

export const metadata = { title: "Add phone" };
export default function Page() { return <div className="mx-auto max-w-6xl"><PhoneForm/></div>; }
