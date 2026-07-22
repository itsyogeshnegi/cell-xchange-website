"use client";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { LoaderCircle, Save } from "lucide-react";

const fields = [["name", "Store name", "text"], ["email", "Contact email", "email"], ["phoneDisplay", "Phone", "tel"], ["hours", "Opening hours", "text"]];

export default function SettingsForm({ initialSettings }) {
  const [values, setValues] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault(); setSaving(true);
    try {
      const { data } = await axios.put("/api/settings", values);
      setValues(data.data); toast.success("Store settings saved");
    } catch (error) { toast.error(error.response?.data?.message || "Could not save settings"); }
    finally { setSaving(false); }
  };

  return <form onSubmit={submit} className="mt-8 rounded-[22px] border border-[#e1e4e1] bg-white p-6"><h2 className="text-sm font-black">Store profile</h2><p className="mt-2 text-xs text-[#7a817c]">These details are stored in MongoDB and used across the public storefront.</p><div className="mt-6 grid gap-5 sm:grid-cols-2">{fields.map(([name, label, type]) => <label key={name} className="text-[11px] font-bold">{label}<input name={name} type={type} required value={values[name] || ""} onChange={update} className="input mt-2"/></label>)}</div><button disabled={saving} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#173f2c] px-5 py-3 text-xs font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle size={15} className="animate-spin"/> : <Save size={15}/>}Save settings</button></form>;
}
