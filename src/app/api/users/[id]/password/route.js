import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { handleError, ok, requireSuperAdmin } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import User from "@/models/User";

const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,128}$/;

export async function PATCH(request, { params }) {
  try {
    await enforceRateLimit(request, { scope: "account-password-reset", limit: 10, windowMs: 15 * 60_000 });
    await requireSuperAdmin();
    if (Number(request.headers.get("content-length") || 0) > 10_000) throw Object.assign(new Error("Request is too large"), { status: 413 });
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) throw Object.assign(new Error("Account not found"), { status: 404 });
    const { newPassword, confirmPassword } = await request.json();
    if (typeof newPassword !== "string" || !strongPassword.test(newPassword)) {
      throw Object.assign(new Error("New password must be 12–128 characters and include uppercase, lowercase, number, and special characters"), { status: 422 });
    }
    if (newPassword !== confirmPassword) throw Object.assign(new Error("New password and confirmation do not match"), { status: 422 });

    await connectDB();
    const user = await User.findById(id).select("+password").maxTimeMS(5000);
    if (!user) throw Object.assign(new Error("Account not found"), { status: 404 });
    if (await user.matchesPassword(newPassword)) throw Object.assign(new Error("New password must be different from the current password"), { status: 422 });
    user.password = newPassword;
    await user.save();
    const response = ok({ changed: true, id: user._id, email: user.email, role: user.role });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return handleError(error);
  }
}
