import jwt from "jsonwebtoken";

const COOKIE_NAME = "mobile_hub_session";
const secret = () => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  return process.env.JWT_SECRET;
};

export const signToken = (user) => jwt.sign({ sub: user._id.toString(), role: user.role, email: user.email }, secret(), { expiresIn: "7d" });
export const verifyToken = (token) => jwt.verify(token, secret());
export const sessionCookie = { name: COOKIE_NAME, options: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 } };
