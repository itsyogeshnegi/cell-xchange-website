import SettingsForm from "@/components/admin/SettingsForm";
import FeaturedProductsOrder from "@/components/admin/FeaturedProductsOrder";
import { requireAdmin } from "@/lib/api";
import { getFeaturedProductsForAdmin } from "@/services/phoneService";
import { getStoreProfile } from "@/services/settingsService";

export const metadata = { title: "Website content" };
export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const [settings, featuredProducts] = await Promise.all([getStoreProfile(), getFeaturedProductsForAdmin()]);
  return <div className="mx-auto max-w-5xl"><p className="eyebrow text-[#718078]">Storefront</p><h1 className="display mt-2 text-4xl font-black">Website content</h1><p className="mt-2 text-sm text-[#747c76]">Edit all public website text, contact details, calls to action, and homepage priorities.</p><FeaturedProductsOrder initialProducts={featuredProducts}/><SettingsForm initialSettings={settings}/></div>;
}
