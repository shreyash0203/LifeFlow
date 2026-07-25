import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: "🔥" },
    frequency: { type: String, enum: ["daily", "weekly"], default: "daily" },
    reminderTime: { type: String, default: null }, // "HH:mm"
    // one entry per date the habit was checked in
    checkIns: [{ date: { type: String, required: true } }], // "YYYY-MM-DD"
    currentStreak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Habit", habitSchema);
