import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { fail, handleError } from "@/lib/api";
import { sessionCookie, signToken } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import User from "@/models/User";

const dummyHash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6Ttx9Yb4PqR4x4.2E8yQ8lQ5fR7mK";

export async function POST(request) {
  try {
    await enforceRateLimit(request, { scope: "auth-login", limit: 5, windowMs: 15 * 60_000 });
    if (Number(request.headers.get("content-length") || 0) > 10_000) return fail("Request is too large", 413);
    const { email: rawEmail, password, remember } = await request.json();
    const email = String(rawEmail || "").trim().toLowerCase().slice(0, 254);
    if (!email || typeof password !== "string" || password.length < 8 || password.length > 128) return fail("Valid email and password are required", 422);
    await connectDB();
    const user = await User.findOne({ email }).select("name email role +password").lean().maxTimeMS(5000);
    const passwordMatches = await bcrypt.compare(password, user?.password || dummyHash);
    if (!user || !passwordMatches) return fail("Invalid email or password", 401);
    const response = NextResponse.json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
    response.cookies.set(sessionCookie.name, signToken(user), { ...sessionCookie.options, maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) { return handleError(error); }
}
