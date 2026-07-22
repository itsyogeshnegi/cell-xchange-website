import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { getStoreProfile } from "@/services/settingsService";

export default async function StoreLayout({ children }) {
  const profile = await getStoreProfile();
  return <><Header profile={profile}/><main>{children}</main><Footer profile={profile}/><WhatsAppButton profile={profile}/></>;
}
