"use client";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, KeyRound, LoaderCircle, ShieldAlert } from "lucide-react";

const emptyForm = { newPassword: "", confirmPassword: "" };

export default function AdminPasswordResetForm({ admin }) {
  const [form, setForm] = useState(emptyForm);
  const [visible, setVisible] = useState({});
  const [saving, setSaving] = useState(false);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (form.newPassword !== form.confirmPassword) return toast.error("New password and confirmation do not match");
    setSaving(true);
    try {
      await axios.patch("/api/users/admin/password", form);
      setForm(emptyForm);
      setVisible({});
      toast.success("Admin password updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update the admin password");
    } finally {
      setSaving(false);
    }
  };

  if (!admin) return <section className="mt-6 rounded-[22px] border border-amber-200 bg-amber-50 p-6">
    <div className="flex items-start gap-3"><ShieldAlert size={19} className="mt-0.5 text-amber-700"/><div><h2 className="text-sm font-black">Admin password reset</h2><p className="mt-1 text-xs text-amber-800">No admin account was found.</p></div></div>
  </section>;

  return <section className="mt-6 rounded-[22px] border border-[#e1e4e1] bg-white p-6">
    <div className="flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff1e8] text-[#9a4314]"><ShieldAlert size={18}/></span>
      <div><h2 className="text-sm font-black">Reset admin password</h2><p className="mt-1 text-xs leading-5 text-[#7a817c]">Super admin only · Set a new password for <strong>{admin.email}</strong>. The existing password cannot be viewed.</p></div>
    </div>
    <form onSubmit={submit} className="mt-6 grid gap-5">
      {[["newPassword", "New admin password"], ["confirmPassword", "Confirm admin password"]].map(([name, label]) => <label key={name} className="text-[11px] font-bold text-[#626b64]">
        {label}
        <span className="relative mt-2 block">
          <input name={name} type={visible[name] ? "text" : "password"} value={form[name]} onChange={update} required minLength={12} maxLength={128} autoComplete="new-password" className="input pr-12"/>
          <button type="button" onClick={() => setVisible((current) => ({ ...current, [name]: !current[name] }))} aria-label={`${visible[name] ? "Hide" : "Show"} ${label.toLowerCase()}`} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737b75]">{visible[name] ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
        </span>
      </label>)}
      <p className="text-[10px] leading-5 text-[#747c76]">Use 12–128 characters with uppercase, lowercase, a number, and a special character.</p>
      <button disabled={saving} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#9a4314] px-6 py-3.5 text-xs font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle size={15} className="animate-spin"/> : <KeyRound size={15}/>} {saving ? "Updating admin password" : "Update admin password"}</button>
    </form>
  </section>;
}
