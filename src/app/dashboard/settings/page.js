import SettingsForm from "@/components/admin/SettingsForm";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import ManagerAccountForm from "@/components/admin/ManagerAccountForm";
import UserAccountsManager from "@/components/admin/UserAccountsManager";
import { requireAdmin } from "@/lib/api";
import { getStoreProfile } from "@/services/settingsService";
import { getAllAccounts, getManagerAccount } from "@/services/userService";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await requireAdmin();
  const [settings, manager, accounts] = await Promise.all([getStoreProfile(), getManagerAccount(), session.role === "super_admin" ? getAllAccounts() : []]);
  return <div className="mx-auto max-w-3xl"><p className="eyebrow text-[#718078]">Workspace</p><h1 className="display mt-2 text-4xl font-black">Settings</h1><p className="mt-2 text-sm text-[#747c76]">Manage the store profile, team access, and account security.</p><SettingsForm initialSettings={settings} mode="profile"/><ManagerAccountForm initialManager={manager}/>{session.role === "super_admin" && <UserAccountsManager accounts={accounts}/>}<ChangePasswordForm/></div>;
}
