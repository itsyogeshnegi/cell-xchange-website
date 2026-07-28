import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request) {
  const token = request.cookies.get("mobile_hub_session")?.value;
  if (!token) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(request.nextUrl.pathname)}`, request.url));
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (!["super_admin", "admin", "manager"].includes(payload.role)) throw new Error("Forbidden");
    const adminOnly = request.nextUrl.pathname.startsWith("/dashboard/settings")
      || request.nextUrl.pathname.startsWith("/dashboard/content");
    if (payload.role === "manager" && adminOnly) return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = { matcher: ["/dashboard/:path*"] };
