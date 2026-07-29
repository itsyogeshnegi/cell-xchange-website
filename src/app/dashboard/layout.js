import DashboardShell from "@/components/admin/DashboardShell";
import { requireDashboardUser } from "@/lib/api";
import { getStoreProfile } from "@/services/settingsService";

export const metadata = { title: { default: "Dashboard", template: "%s — cell.xchange Admin" } };

export default async function DashboardLayout({ children }) {
  const [profile, session] = await Promise.all([getStoreProfile(), requireDashboardUser()]);
  return <DashboardShell profile={profile} role={session.role}>{children}</DashboardShell>;
}
