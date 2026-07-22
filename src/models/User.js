import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false, minlength: 8 },
  role: { type: String, enum: ["admin", "staff"], default: "staff" },
}, { timestamps: true });
userSchema.pre("save", async function () { if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 12); });
userSchema.methods.matchesPassword = function (value) { return bcrypt.compare(value, this.password); };
export default mongoose.models.User || mongoose.model("User", userSchema);
