import express from "express";
import { body, validationResult } from "express-validator";
import Expense from "../models/Expense.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const { month, type, category } = req.query; // month = "YYYY-MM"
    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (month) {
      const start = new Date(`${month}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      filter.date = { $gte: start, $lt: end };
    }
    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    next(err);
  }
});

// Monthly summary: totals + category breakdown, for charts
router.get("/summary", async (req, res, next) => {
  try {
    const { month } = req.query;
    const start = month ? new Date(`${month}-01T00:00:00.000Z`) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const results = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: { type: "$type", category: "$category" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totals = { income: 0, expense: 0 };
    const byCategory = {};
    results.forEach((r) => {
      totals[r._id.type] += r.total;
      if (r._id.type === "expense") {
        byCategory[r._id.category] = (byCategory[r._id.category] || 0) + r.total;
      }
    });

    res.json({
      totals,
      balance: totals.income - totals.expense,
      byCategory,
      topCategory: Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0] || null,
    });
  } catch (err) {
    next(err);
  }
});

// CSV export
router.get("/export/csv", async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    const header = "Date,Type,Category,Amount,Note\n";
    const rows = expenses
      .map((e) => `${e.date.toISOString().slice(0, 10)},${e.type},${e.category},${e.amount},"${(e.note || "").replace(/"/g, '""')}"`)
      .join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=lifeflow-expenses.csv");
    res.send(header + rows);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  [
    body("type").isIn(["income", "expense"]),
    body("amount").isFloat({ min: 0 }).withMessage("Amount must be a positive number"),
    body("category").trim().notEmpty().withMessage("Category is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

      const expense = await Expense.create({ ...req.body, user: req.user._id });
      res.status(201).json(expense);
    } catch (err) {
      next(err);
    }
  }
);

router.put("/:id", async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
