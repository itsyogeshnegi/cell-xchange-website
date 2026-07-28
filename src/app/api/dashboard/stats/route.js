import { handleError, ok, requireDashboardUser } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getDashboardStats } from "@/services/dashboardService";

export async function GET(request) {
  try {
    await enforceRateLimit(request, { scope: "dashboard-stats", limit: 60 });
    await requireDashboardUser();
    return ok(await getDashboardStats());
  } catch (error) { return handleError(error); }
}
