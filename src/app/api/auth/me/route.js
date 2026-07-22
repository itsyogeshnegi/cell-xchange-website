import { connectDB } from "@/lib/db";
import { handleError, ok, requireAdmin } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import User from "@/models/User";

export async function GET(request) {
  try {
    await enforceRateLimit(request, { scope: "auth-me", limit: 60 });
    const session = await requireAdmin();
    await connectDB();
    const user = await User.findById(session.sub).select("name email role createdAt").lean().maxTimeMS(5000);
    return ok(user);
  } catch (error) { return handleError(error); }
}
