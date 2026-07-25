import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["owner", "member", "admin"], default: "owner" },
    // For "shared family/team use" - members belong to a household/workspace
    householdId: { type: mongoose.Schema.Types.ObjectId, default: null },
    theme: { type: String, enum: ["light", "dark"], default: "light" },
    reminderPrefs: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
    },
    avatarColor: { type: String, default: "#6366f1" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    theme: this.theme,
    reminderPrefs: this.reminderPrefs,
    avatarColor: this.avatarColor,
  };
};

export default mongoose.model("User", userSchema);
