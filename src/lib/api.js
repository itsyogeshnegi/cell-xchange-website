import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sessionCookie, verifyToken } from "@/lib/auth";

export const ok = (data, status = 200) => NextResponse.json({ success: true, data }, { status });
export const fail = (message, status = 400, details) => NextResponse.json({ success: false, message, ...(details && { details }) }, { status });

export async function requireAdmin() {
  const store = await cookies();
  const token = store.get(sessionCookie.name)?.value;
  if (!token) throw Object.assign(new Error("Authentication required"), { status: 401 });
  const payload = verifyToken(token);
  if (payload.role !== "admin") throw Object.assign(new Error("Administrator access required"), { status: 403 });
  return payload;
}

export function handleError(error) {
  console.error(error);
  if (error.name === "ValidationError") return fail("Validation failed", 422, Object.values(error.errors).map((item) => item.message));
  if (error.code === 11000) return fail("A record with that value already exists", 409);
  const response = fail(error.message || "Something went wrong", error.status || 500);
  if (error.retryAfter) response.headers.set("Retry-After", String(error.retryAfter));
  return response;
}
