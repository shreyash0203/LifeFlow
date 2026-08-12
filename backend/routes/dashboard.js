import express from "express";
import Task from "../models/Task.js";
import Habit from "../models/Habit.js";
import Expense from "../models/Expense.js";
import Note from "../models/Note.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const userId = req.user._id;

    // -----------------------------
    // DATE RANGES
    // -----------------------------

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    // -----------------------------
    // GET DASHBOARD DATA
    // -----------------------------

    const [
      todayTasks,
      allTasks,
      habits,
      recentExpenses,
      monthExpenses,
      pinnedNotes,
    ] = await Promise.all([
      // Today's tasks
      Task.find({
        user: userId,
        dueDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }).sort({ dueDate: 1 }),

      // All tasks
      Task.find({
        user: userId,
      }),

      // Active habits
      Habit.find({
        user: userId,
        archived: false,
      }),

      // Recent expenses
      Expense.find({
        user: userId,
      })
        .sort({ date: -1 })
        .limit(5),

      // This month's expenses/income
      Expense.find({
        user: userId,
        date: {
          $gte: startOfMonth,
        },
      }),

      // Pinned notes
      Note.find({
        user: userId,
        pinned: true,
      })
        .sort({ updatedAt: -1 })
        .limit(5),
    ]);

    // -----------------------------
    // SMART INSIGHTS
    // -----------------------------

    const completedTasks = allTasks.filter(
      (task) =>
        task.status === "completed" &&
        task.completedAt
    );

    // Most productive day
    const dayCounts = {};

    completedTasks.forEach((task) => {
      const day = new Date(
        task.completedAt
      ).toLocaleDateString("en-US", {
        weekday: "long",
      });

      dayCounts[day] =
        (dayCounts[day] || 0) + 1;
    });

    const mostProductiveDay =
      Object.entries(dayCounts).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] ||
      "Not enough data yet";

    // Highest spending category
    const categoryTotals = {};

    monthExpenses
      .filter(
        (expense) =>
          expense.type === "expense"
      )
      .forEach((expense) => {
        categoryTotals[expense.category] =
          (categoryTotals[expense.category] ||
            0) + expense.amount;
      });

    const highestSpendingCategory =
      Object.entries(categoryTotals).sort(
        (a, b) => b[1] - a[1]
      )[0] || null;

    // -----------------------------
    // HABIT STREAK RISK
    // -----------------------------

    const today = new Date()
      .toISOString()
      .slice(0, 10);

    const yesterday = new Date(
      Date.now() - 86400000
    )
      .toISOString()
      .slice(0, 10);

    const habitsAtRisk = habits.filter(
      (habit) => {
        const checkedRecently =
          habit.checkIns.some(
            (checkIn) =>
              checkIn.date === today ||
              checkIn.date === yesterday
          );

        return (
          habit.currentStreak > 0 &&
          !checkedRecently
        );
      }
    );

    // -----------------------------
    // INCOME / EXPENSE
    // -----------------------------

    const income = monthExpenses
      .filter(
        (expense) =>
          expense.type === "income"
      )
      .reduce(
        (sum, expense) =>
          sum + expense.amount,
        0
      );

    const expense = monthExpenses
      .filter(
        (expense) =>
          expense.type === "expense"
      )
      .reduce(
        (sum, expense) =>
          sum + expense.amount,
        0
      );

    // -----------------------------
    // SEND RESPONSE
    // -----------------------------

    res.json({
      todayTasks,

      taskStats: {
        total: allTasks.length,

        completed:
          completedTasks.length,

        pending:
          allTasks.filter(
            (task) =>
              task.status === "pending"
          ).length,
      },

      habits: habits.map((habit) => ({
        _id: habit._id,
        name: habit.name,
        icon: habit.icon,
        currentStreak:
          habit.currentStreak,
        bestStreak:
          habit.bestStreak,

        checkedToday:
          habit.checkIns.some(
            (checkIn) =>
              checkIn.date === today
          ),
      })),

      recentExpenses,

      monthSummary: {
        income,
        expense,
        balance: income - expense,
      },

      pinnedNotes,

      insights: {
        mostProductiveDay,

        highestSpendingCategory:
          highestSpendingCategory
            ? {
                category:
                  highestSpendingCategory[0],
                amount:
                  highestSpendingCategory[1],
              }
            : null,

        habitsAtRisk:
          habitsAtRisk.map((habit) => ({
            id: habit._id,
            name: habit.name,
            streak:
              habit.currentStreak,
          })),
      },
    });
  } catch (err) {
    console.error(
      "Dashboard error:",
      err
    );

    next(err);
  }
});

export default router;