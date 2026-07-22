import SettingsForm from "@/components/admin/SettingsForm";
import { getStoreProfile } from "@/services/settingsService";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const settings = await getStoreProfile();
  return <div className="mx-auto max-w-3xl"><p className="eyebrow text-[#718078]">Workspace</p><h1 className="display mt-2 text-4xl font-black">Settings</h1><SettingsForm initialSettings={{ name: settings.name, email: settings.email, phoneDisplay: settings.phoneDisplay, hours: settings.hours }}/></div>;
}
