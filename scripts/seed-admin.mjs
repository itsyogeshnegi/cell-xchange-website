import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const args = process.argv.slice(2);
const value = (name) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
};

const name = value("name") || process.env.ADMIN_NAME;
const email = value("email") || process.env.ADMIN_EMAIL;
const password = value("password") || process.env.ADMIN_PASSWORD;

if (!process.env.MONGODB_URI || !name || !email || !password) {
  console.error("Provide MONGODB_URI and ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD environment variables or matching CLI arguments.");
  process.exit(1);
}

if (password.length < 12) {
  console.error("ADMIN_PASSWORD must contain at least 12 characters.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
const users = mongoose.connection.collection("users");
await users.updateOne(
  { email: email.toLowerCase() },
  { $set: { name, email: email.toLowerCase(), password: await bcrypt.hash(password, 12), role: "admin", updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
  { upsert: true },
);
console.log(`Admin ready: ${email}`);
await mongoose.disconnect();
