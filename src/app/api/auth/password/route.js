import { connectDB } from "@/lib/db";
import { handleError, ok, requireAdmin } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import User from "@/models/User";

const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,128}$/;

export async function PATCH(request) {
  try {
    await enforceRateLimit(request, { scope: "auth-password", limit: 5, windowMs: 15 * 60_000 });
    const session = await requireAdmin();
    if (Number(request.headers.get("content-length") || 0) > 10_000) {
      throw Object.assign(new Error("Request is too large"), { status: 413 });
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();
    if (typeof currentPassword !== "string" || currentPassword.length < 8 || currentPassword.length > 128) {
      throw Object.assign(new Error("Enter your current password"), { status: 422 });
    }
    if (typeof newPassword !== "string" || !strongPassword.test(newPassword)) {
      throw Object.assign(new Error("New password must be 12–128 characters and include uppercase, lowercase, number, and special characters"), { status: 422 });
    }
    if (newPassword !== confirmPassword) {
      throw Object.assign(new Error("New password and confirmation do not match"), { status: 422 });
    }
    if (newPassword === currentPassword) {
      throw Object.assign(new Error("New password must be different from your current password"), { status: 422 });
    }

    await connectDB();
    const user = await User.findById(session.sub).select("+password").maxTimeMS(5000);
    if (!user) throw Object.assign(new Error("Administrator account not found"), { status: 404 });
    if (!(await user.matchesPassword(currentPassword))) {
      throw Object.assign(new Error("Current password is incorrect"), { status: 401 });
    }

    user.password = newPassword;
    await user.save();
    const response = ok({ changed: true });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return handleError(error);
  }
}

