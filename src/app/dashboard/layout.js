import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { getStoreProfile } from "@/services/settingsService";
export const metadata={title:{default:"Dashboard",template:"%s — cell.xchange Admin"}};
export default async function DashboardLayout({children}){const profile=await getStoreProfile();return <div className="min-h-screen bg-[#f5f6f4]"><Sidebar profile={profile}/><div className="lg:pl-64"><AdminHeader profile={profile}/><main className="p-4 sm:p-8">{children}</main></div></div>}
