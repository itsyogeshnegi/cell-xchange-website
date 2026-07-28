import SettingsForm from "@/components/admin/SettingsForm";
import AdminPasswordResetForm from "@/components/admin/AdminPasswordResetForm";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import ManagerAccountForm from "@/components/admin/ManagerAccountForm";
import { requireAdmin } from "@/lib/api";
import { getStoreProfile } from "@/services/settingsService";
import { getAdminAccount, getManagerAccount } from "@/services/userService";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await requireAdmin();
  const [settings, manager, admin] = await Promise.all([getStoreProfile(), getManagerAccount(), session.role === "super_admin" ? getAdminAccount() : null]);
  return <div className="mx-auto max-w-3xl"><p className="eyebrow text-[#718078]">Workspace</p><h1 className="display mt-2 text-4xl font-black">Settings</h1><p className="mt-2 text-sm text-[#747c76]">Manage the store profile, team access, and account security.</p><SettingsForm initialSettings={settings} mode="profile"/><ManagerAccountForm initialManager={manager}/>{session.role === "super_admin" && <AdminPasswordResetForm admin={admin}/>}<ChangePasswordForm/></div>;
}
