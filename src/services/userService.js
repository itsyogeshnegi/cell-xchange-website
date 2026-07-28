import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function getManagerAccount() {
  if (!process.env.MONGODB_URI) return null;
  await connectDB();
  const manager = await User.findOne({ role: "manager" })
    .select("name email role updatedAt")
    .lean()
    .maxTimeMS(5000);
  return manager ? JSON.parse(JSON.stringify(manager)) : null;
}

export async function getAllAccounts() {
  if (!process.env.MONGODB_URI) return [];
  await connectDB();
  const accounts = await User.find({})
    .select("name email role createdAt updatedAt")
    .sort({ role: 1, createdAt: 1 })
    .lean()
    .maxTimeMS(5000);
  return JSON.parse(JSON.stringify(accounts));
}
