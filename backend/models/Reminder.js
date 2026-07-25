import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    notes: { type: String, default: "" },
    dateTime: { type: Date, required: true },
    recurrence: {
      type: String,
      enum: ["none", "daily", "weekly", "monthly"],
      default: "none",
    },
    status: { type: String, enum: ["active", "done", "snoozed"], default: "active" },
    notifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Reminder", reminderSchema);
