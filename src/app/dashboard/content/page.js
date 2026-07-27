import SettingsForm from "@/components/admin/SettingsForm";
import { getStoreProfile } from "@/services/settingsService";

export const metadata = { title: "Website content" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const settings = await getStoreProfile();
  return <div className="mx-auto max-w-5xl"><p className="eyebrow text-[#718078]">Storefront</p><h1 className="display mt-2 text-4xl font-black">Website content</h1><p className="mt-2 text-sm text-[#747c76]">Edit all public website text, contact details, calls to action, and the homepage hero image.</p><SettingsForm initialSettings={settings}/></div>;
}
