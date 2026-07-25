import express from "express";
import Task from "../models/Task.js";
import Habit from "../models/Habit.js";
import Expense from "../models/Expense.js";
import Note from "../models/Note.js";
import Reminder from "../models/Reminder.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const userId = req.user._id;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [todayTasks, allTasks, habits, recentExpenses, monthExpenses, upcomingReminders, pinnedNotes] =
      await Promise.all([
        Task.find({ user: userId, dueDate: { $gte: startOfDay, $lte: endOfDay } }),
        Task.find({ user: userId }),
        Habit.find({ user: userId, archived: false }),
        Expense.find({ user: userId }).sort({ date: -1 }).limit(5),
        Expense.find({ user: userId, date: { $gte: startOfMonth } }),
        Reminder.find({ user: userId, status: "active", dateTime: { $gte: new Date() } })
          .sort({ dateTime: 1 })
          .limit(5),
        Note.find({ user: userId, pinned: true }).sort({ updatedAt: -1 }).limit(5),
      ]);

    // --- Smart insights ---
    const completedTasks = allTasks.filter((t) => t.status === "completed" && t.completedAt);
    const dayCounts = {};
    completedTasks.forEach((t) => {
      const day = new Date(t.completedAt).toLocaleDateString("en-US", { weekday: "long" });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const mostProductiveDay =
      Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Not enough data yet";

    const categoryTotals = {};
    monthExpenses
      .filter((e) => e.type === "expense")
      .forEach((e) => (categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount));
    const highestSpendingCategory =
      Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || null;

    const habitsAtRisk = habits.filter((h) => {
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const checkedRecently = h.checkIns.some((c) => c.date === today || c.date === yesterday);
      return h.currentStreak > 0 && !checkedRecently;
    });

    const income = monthExpenses.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);
    const expense = monthExpenses.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);

    res.json({
      todayTasks,
      taskStats: {
        total: allTasks.length,
        completed: completedTasks.length,
        pending: allTasks.filter((t) => t.status === "pending").length,
      },
      habits: habits.map((h) => ({
        _id: h._id,
        name: h.name,
        icon: h.icon,
        currentStreak: h.currentStreak,
        bestStreak: h.bestStreak,
        checkedToday: h.checkIns.some((c) => c.date === new Date().toISOString().slice(0, 10)),
      })),
      recentExpenses,
      monthSummary: { income, expense, balance: income - expense },
      upcomingReminders,
      pinnedNotes,
      insights: {
        mostProductiveDay,
        highestSpendingCategory: highestSpendingCategory
          ? { category: highestSpendingCategory[0], amount: highestSpendingCategory[1] }
          : null,
        habitsAtRisk: habitsAtRisk.map((h) => ({ id: h._id, name: h.name, streak: h.currentStreak })),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
