import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
export const metadata={title:{default:"Dashboard",template:"%s — cell.xchange Admin"}};
export default function DashboardLayout({children}){return <div className="min-h-screen bg-[#f5f6f4]"><Sidebar/><div className="lg:pl-64"><AdminHeader/><main className="p-4 sm:p-8">{children}</main></div></div>}
