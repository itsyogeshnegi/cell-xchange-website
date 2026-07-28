"use client";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";

const emptyForm = { currentPassword: "", newPassword: "", confirmPassword: "" };

function PasswordInput({ label, name, value, onChange, visible, onToggle, autoComplete }) {
  return <label className="block text-[11px] font-bold text-[#626b64]">
    {label}
    <span className="relative mt-2 block">
      <input
        type={visible ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
        minLength={name === "currentPassword" ? 8 : 12}
        maxLength={128}
        className="input pr-12"
      />
      <button type="button" onClick={onToggle} aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737b75]">
        {visible ? <EyeOff size={16}/> : <Eye size={16}/>}
      </button>
    </span>
  </label>;
}

export default function ChangePasswordForm() {
  const [form, setForm] = useState(emptyForm);
  const [visible, setVisible] = useState({});
  const [saving, setSaving] = useState(false);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (form.newPassword !== form.confirmPassword) return toast.error("New password and confirmation do not match");
    setSaving(true);
    try {
      await axios.patch("/api/auth/password", form);
      setForm(emptyForm);
      setVisible({});
      toast.success("Password updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update password");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    ["currentPassword", "Current password", "current-password"],
    ["newPassword", "New password", "new-password"],
    ["confirmPassword", "Confirm new password", "new-password"],
  ];

  return <section className="mt-6 rounded-[22px] border border-[#e1e4e1] bg-white p-6">
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#edf4ef] text-[#173f2c]"><KeyRound size={18}/></span>
      <div><h2 className="text-sm font-black">Change password</h2><p className="mt-1 text-xs leading-5 text-[#7a817c]">Update the password used to access this administrator account.</p></div>
    </div>
    <form onSubmit={submit} className="mt-6 grid gap-5">
      {fields.map(([name, label, autoComplete]) => <PasswordInput
        key={name}
        name={name}
        label={label}
        value={form[name]}
        onChange={update}
        autoComplete={autoComplete}
        visible={Boolean(visible[name])}
        onToggle={() => setVisible((current) => ({ ...current, [name]: !current[name] }))}
      />)}
      <p className="flex items-start gap-2 rounded-xl bg-[#f6f7f5] px-4 py-3 text-[10px] leading-5 text-[#69716c]"><ShieldCheck size={15} className="mt-0.5 shrink-0"/>Use at least 12 characters with uppercase, lowercase, a number, and a special character.</p>
      <button disabled={saving} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#173f2c] px-6 py-3.5 text-xs font-bold text-white disabled:opacity-60">
        {saving ? <LoaderCircle size={15} className="animate-spin"/> : <KeyRound size={15}/>}
        {saving ? "Updating password" : "Update password"}
      </button>
    </form>
  </section>;
}

