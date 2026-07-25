import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
    dueDate: { type: Date, default: null },
    tags: [{ type: String, trim: true }],
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.index({ title: "text", description: "text", tags: "text" });

export default mongoose.model("Task", taskSchema);
