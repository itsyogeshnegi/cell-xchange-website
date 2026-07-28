"use client";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, LoaderCircle, Save, UserCog } from "lucide-react";

export default function ManagerAccountForm({ initialManager }) {
  const [form, setForm] = useState({
    name: initialManager?.name || "",
    email: initialManager?.email || "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exists, setExists] = useState(Boolean(initialManager));
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.put("/api/users/manager", form);
      setForm({ name: data.data.name, email: data.data.email, password: "" });
      setShowPassword(false);
      setExists(true);
      toast.success(exists ? "Manager account updated" : "Manager account created");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save manager account");
    } finally {
      setSaving(false);
    }
  };

  return <section className="mt-6 rounded-[22px] border border-[#e1e4e1] bg-white p-6">
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eef1ff] text-[#284dbe]"><UserCog size={19}/></span>
      <div>
        <h2 className="text-sm font-black">Manager account</h2>
        <p className="mt-1 text-xs leading-5 text-[#7a817c]">Managers can operate inventory and invoices, but cannot access Website Content or Settings.</p>
      </div>
    </div>
    <form onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2">
      <label className="text-[11px] font-bold text-[#626b64]">Manager name *<input name="name" value={form.name} onChange={update} required maxLength={80} className="input mt-2"/></label>
      <label className="text-[11px] font-bold text-[#626b64]">Manager email *<input name="email" type="email" value={form.email} onChange={update} required autoComplete="off" className="input mt-2"/></label>
      <label className="text-[11px] font-bold text-[#626b64] sm:col-span-2">
        {exists ? "Set new manager password" : "Manager password *"}
        <span className="relative mt-2 block">
          <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={update} required={!exists} minLength={12} maxLength={128} autoComplete="new-password" placeholder={exists ? "Leave blank to keep the current password" : "Create a strong manager password"} className="input pr-12"/>
          <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={`${showPassword ? "Hide" : "Show"} manager password`} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737b75]">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
        </span>
      </label>
      <p className="text-[10px] leading-5 text-[#747c76] sm:col-span-2">For security, the existing manager password cannot be viewed. Enter a new password here whenever the admin needs to reset it. Use at least 12 characters with uppercase, lowercase, a number, and a special character.</p>
      <button disabled={saving} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#173f2c] px-6 py-3.5 text-xs font-bold text-white disabled:opacity-60 sm:col-span-2">{saving ? <LoaderCircle size={15} className="animate-spin"/> : <Save size={15}/>} {saving ? "Saving manager" : exists ? "Update manager" : "Create manager"}</button>
    </form>
  </section>;
}

