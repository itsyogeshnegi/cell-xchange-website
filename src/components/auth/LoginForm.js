"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { store } from "@/lib/store";

export default function LoginForm() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const submit = async (data) => { try { await axios.post("/api/auth/login", data); toast.success("Welcome back"); router.push("/dashboard"); router.refresh(); } catch (error) { toast.error(error.response?.data?.message || "Unable to sign in"); } };
  return <form onSubmit={handleSubmit(submit)} className="mt-8"><label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[.1em]">Email address</span><input type="email" autoComplete="email" placeholder="admin@cellxchange.in" className="input" {...register("email", { required: "Email is required" })}/>{errors.email && <span className="mt-1 block text-[10px] text-red-600">{errors.email.message}</span>}</label><label className="mt-5 block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[.1em]">Password</span><div className="relative"><input type={show ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" className="input pr-12" {...register("password", { required: "Password is required", minLength: { value: 8, message: "Use at least 8 characters" } })}/><button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7e8187]">{show ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div>{errors.password && <span className="mt-1 block text-[10px] text-red-600">{errors.password.message}</span>}</label><div className="mt-5 flex items-center justify-between"><label className="flex items-center gap-2 text-xs text-[#686b71]"><input type="checkbox" className="accent-black" {...register("remember")}/>Remember me</label><a href={`mailto:${store.email}?subject=Password reset`} className="text-xs font-semibold text-black underline-offset-4 hover:underline">Forgot password?</a></div><button disabled={isSubmitting} className="mt-7 flex w-full items-center justify-center gap-2 bg-black py-4 text-[10px] font-bold uppercase tracking-[.14em] text-white hover:bg-[#1f55ff] disabled:opacity-60">{isSubmitting ? <LoaderCircle className="animate-spin" size={16}/> : <>Sign in <ArrowRight size={15}/></>}</button><p className="mt-6 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[.1em] text-[#8a8d92]"><LockKeyhole size={12}/>Secure encrypted access</p></form>;
}
