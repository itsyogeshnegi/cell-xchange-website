"use client";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, KeyRound, LoaderCircle, ShieldCheck, Users, X } from "lucide-react";

const roleLabels = { super_admin: "Super admin", admin: "Admin", manager: "Manager" };
const emptyForm = { newPassword: "", confirmPassword: "" };

export default function UserAccountsManager({ accounts }) {
  const [target, setTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [visible, setVisible] = useState({});
  const [saving, setSaving] = useState(false);

  const close = () => { setTarget(null); setForm(emptyForm); setVisible({}); };
  const submit = async (event) => {
    event.preventDefault();
    if (form.newPassword !== form.confirmPassword) return toast.error("New password and confirmation do not match");
    setSaving(true);
    try {
      await axios.patch(`/api/users/${target._id}/password`, form);
      toast.success(`${target.email} password updated`);
      close();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update account password");
    } finally {
      setSaving(false);
    }
  };

  return <section className="mt-6 rounded-[22px] border border-[#e1e4e1] bg-white p-6">
    <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f0edff] text-[#5941a9]"><Users size={18}/></span><div><h2 className="text-sm font-black">All user accounts</h2><p className="mt-1 text-xs leading-5 text-[#7a817c]">Super admin only · View every dashboard account and set a replacement password.</p></div></div>
    <div className="mt-6 overflow-x-auto rounded-2xl border border-[#e7e9e7]">
      <table className="w-full min-w-[620px] text-left text-xs"><thead className="bg-[#f7f8f6] text-[9px] uppercase tracking-wider text-[#858c87]"><tr><th className="px-4 py-3">Account</th><th>Role</th><th>Password</th><th>Updated</th><th className="pr-4 text-right">Action</th></tr></thead><tbody>{accounts.map((account) => <tr key={account._id} className="border-t border-[#eceeec]"><td className="px-4 py-4"><strong className="block">{account.name}</strong><span className="mt-1 block text-[10px] text-[#7a817c]">{account.email}</span></td><td><span className="rounded-full bg-[#eef1ee] px-2.5 py-1 text-[9px] font-bold">{roleLabels[account.role] || account.role}</span></td><td><span className="inline-flex items-center gap-1.5 text-[10px] text-[#7a817c]"><ShieldCheck size={13}/>Encrypted · hidden</span></td><td className="text-[10px] text-[#7a817c]">{new Date(account.updatedAt).toLocaleDateString("en-IN")}</td><td className="pr-4 text-right"><button onClick={() => setTarget(account)} className="inline-flex items-center gap-1.5 rounded-full border border-[#dfe2df] px-3 py-2 text-[10px] font-bold hover:bg-[#f3f5f2]"><KeyRound size={13}/>Set password</button></td></tr>)}</tbody></table>
    </div>
    <p className="mt-3 text-[10px] leading-5 text-[#7a817c]">Current passwords cannot be displayed because only one-way bcrypt hashes are stored. Password hashes are never sent to the browser.</p>

    {target && <div className="fixed inset-0 z-[160] grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="reset-user-password-title">
      <div className="w-full max-w-md rounded-[22px] bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h2 id="reset-user-password-title" className="text-lg font-black">Set account password</h2><p className="mt-1 text-xs text-[#747c76]">{target.email} · {roleLabels[target.role]}</p></div><button type="button" onClick={close} disabled={saving} aria-label="Close password reset" className="grid size-9 place-items-center rounded-full bg-[#f2f3f1] disabled:opacity-50"><X size={16}/></button></div>
        <form onSubmit={submit} className="mt-6 grid gap-5">{[["newPassword", "New password"], ["confirmPassword", "Confirm new password"]].map(([name, label]) => <label key={name} className="text-[11px] font-bold text-[#626b64]">{label}<span className="relative mt-2 block"><input name={name} type={visible[name] ? "text" : "password"} value={form[name]} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} required minLength={12} maxLength={128} autoComplete="new-password" className="input pr-12"/><button type="button" onClick={() => setVisible((current) => ({ ...current, [name]: !current[name] }))} aria-label={`${visible[name] ? "Hide" : "Show"} ${label.toLowerCase()}`} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737b75]">{visible[name] ? <EyeOff size={16}/> : <Eye size={16}/>}</button></span></label>)}<p className="text-[10px] leading-5 text-[#747c76]">Use 12–128 characters with uppercase, lowercase, a number, and a special character.</p><button disabled={saving} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#5941a9] px-6 py-3.5 text-xs font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle size={15} className="animate-spin"/> : <KeyRound size={15}/>} {saving ? "Updating password" : "Set new password"}</button></form>
      </div>
    </div>}
  </section>;
}
