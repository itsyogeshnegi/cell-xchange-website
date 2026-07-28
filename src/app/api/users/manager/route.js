import { connectDB } from "@/lib/db";
import { handleError, ok, requireAdmin } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import User from "@/models/User";

const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,128}$/;

export async function PUT(request) {
  try {
    await enforceRateLimit(request, { scope: "manager-account", limit: 10, windowMs: 15 * 60_000 });
    await requireAdmin();
    if (Number(request.headers.get("content-length") || 0) > 10_000) {
      throw Object.assign(new Error("Request is too large"), { status: 413 });
    }

    const body = await request.json();
    const name = String(body.name || "").trim().slice(0, 80);
    const email = String(body.email || "").trim().toLowerCase().slice(0, 254);
    const password = typeof body.password === "string" ? body.password : "";
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
      throw Object.assign(new Error("Enter a valid manager name and email"), { status: 422 });
    }

    await connectDB();
    let manager = await User.findOne({ role: "manager" }).select("+password").maxTimeMS(5000);
    if (!manager && !strongPassword.test(password)) {
      throw Object.assign(new Error("A new manager password must be 12–128 characters and include uppercase, lowercase, number, and special characters"), { status: 422 });
    }
    if (password && !strongPassword.test(password)) {
      throw Object.assign(new Error("Manager password must be 12–128 characters and include uppercase, lowercase, number, and special characters"), { status: 422 });
    }

    if (!manager) manager = new User({ role: "manager" });
    manager.name = name;
    manager.email = email;
    manager.role = "manager";
    if (password) manager.password = password;
    await manager.save();

    return ok({ id: manager._id, name: manager.name, email: manager.email, role: manager.role, passwordChanged: Boolean(password) });
  } catch (error) {
    return handleError(error);
  }
}

