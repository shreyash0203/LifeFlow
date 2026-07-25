import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    note: { type: String, trim: true, default: "" },
    date: { type: Date, required: true, default: Date.now },
    attachment: { type: String, default: null }, // file path/url for receipt
  },
  { timestamps: true }
);

expenseSchema.index({ user: 1, date: -1 });

export default mongoose.model("Expense", expenseSchema);
