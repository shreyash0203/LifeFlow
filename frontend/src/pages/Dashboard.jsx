import { useEffect, useState } from "react";
import {
  CheckSquare,
  Flame,
  Wallet,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

import {
  Card,
  StatCard,
} from "../components/Common/Card";

import api from "../api/axios";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    api
      .get("/dashboard")
      .then(({ data }) => {
        setData(data);
      })
      .catch((error) => {
        console.error(
          "Failed to load dashboard:",
          error
        );
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // -----------------------------
  // LOADING
  // -----------------------------

  if (loading) {
    return (
      <p className="text-gray-400">
        Loading your dashboard...
      </p>
    );
  }

  // -----------------------------
  // ERROR
  // -----------------------------

  if (!data) {
    return (
      <p className="text-gray-400">
        Could not load dashboard data.
      </p>
    );
  }

  const {
    todayTasks,
    taskStats,
    habits,
    recentExpenses,
    monthSummary,
    pinnedNotes,
    insights,
  } = data;

  return (
    <div className="space-y-6">

      {/* ========================= */}
      {/* STAT CARDS */}
      {/* ========================= */}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

        <StatCard
          label="Tasks today"
          value={todayTasks.length}
          icon={<CheckSquare />}
        />

        <StatCard
          label="Active habits"
          value={habits.length}
          icon={<Flame />}
          accent="text-orange-500"
        />

        <StatCard
          label="Month balance"
          value={`₹${monthSummary.balance.toLocaleString()}`}
          icon={<Wallet />}
          accent={
            monthSummary.balance >= 0
              ? "text-green-600"
              : "text-red-500"
          }
        />

      </div>

      {/* ========================= */}
      {/* SMART INSIGHTS */}
      {/* ========================= */}

      <Card title="Smart insights">

        <div className="grid md:grid-cols-3 gap-4 text-sm">

          {/* Most productive day */}

          <div className="flex items-start gap-3">

            <TrendingUp
              className="text-primary-600 mt-0.5"
              size={18}
            />

            <div>
              <p className="font-medium">
                Most productive day
              </p>

              <p className="text-gray-500">
                {insights.mostProductiveDay}
              </p>
            </div>

          </div>

          {/* Highest spending */}

          <div className="flex items-start gap-3">

            <Wallet
              className="text-amber-500 mt-0.5"
              size={18}
            />

            <div>
              <p className="font-medium">
                Highest spending category
              </p>

              <p className="text-gray-500">

                {insights.highestSpendingCategory
                  ? `${insights.highestSpendingCategory.category} — ₹${insights.highestSpendingCategory.amount.toLocaleString()}`
                  : "No expenses yet"}

              </p>
            </div>

          </div>

          {/* Habit risk */}

          <div className="flex items-start gap-3">

            <AlertTriangle
              className="text-red-500 mt-0.5"
              size={18}
            />

            <div>

              <p className="font-medium">
                Habit streak risk
              </p>

              <p className="text-gray-500">

                {insights.habitsAtRisk.length
                  ? insights.habitsAtRisk
                      .map(
                        (habit) =>
                          habit.name
                      )
                      .join(", ")
                  : "All streaks are safe today 🎉"}

              </p>

            </div>

          </div>

        </div>

      </Card>

      {/* ========================= */}
      {/* DASHBOARD CONTENT */}
      {/* ========================= */}

      <div className="grid md:grid-cols-2 gap-6">

        {/* TODAY'S TASKS */}

        <Card title="Today's tasks">

          {todayTasks.length === 0 && (
            <p className="text-sm text-gray-400">
              Nothing due today. Enjoy the
              calm.
            </p>
          )}

          <ul className="space-y-2">

            {todayTasks.map((task) => (
              <li
                key={task._id}
                className="flex items-center justify-between text-sm"
              >

                <span
                  className={
                    task.status ===
                    "completed"
                      ? "line-through text-gray-400"
                      : ""
                  }
                >
                  {task.title}
                </span>

                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    task.priority === "high"
                      ? "bg-red-100 text-red-600 dark:bg-red-500/10"
                      : task.priority ===
                        "medium"
                      ? "bg-amber-100 text-amber-600 dark:bg-amber-500/10"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                  }`}
                >
                  {task.priority}
                </span>

              </li>
            ))}

          </ul>

          <p className="text-xs text-gray-400 mt-3">
            {taskStats.completed}/
            {taskStats.total} tasks completed
            overall
          </p>

        </Card>

        {/* HABIT STREAKS */}

        <Card title="Habit streaks">

          <ul className="space-y-3">

            {habits.map((habit) => (
              <li
                key={habit._id}
                className="flex items-center justify-between text-sm"
              >

                <span>
                  {habit.icon}{" "}
                  {habit.name}
                </span>

                <span className="flex items-center gap-1 text-orange-500 font-medium">

                  🔥{" "}
                  {habit.currentStreak}d

                  {habit.checkedToday && (
                    <span className="text-green-500 ml-1">
                      ✓
                    </span>
                  )}

                </span>

              </li>
            ))}

            {habits.length === 0 && (
              <p className="text-sm text-gray-400">
                No habits yet — add one to
                start a streak.
              </p>
            )}

          </ul>

        </Card>

        {/* RECENT EXPENSES */}

        <Card title="Recent expenses">

          <ul className="space-y-2">

            {recentExpenses.map((expense) => (
              <li
                key={expense._id}
                className="flex items-center justify-between text-sm"
              >

                <span>
                  {expense.category}

                  <span className="text-gray-400">
                    {" "}
                    — {expense.note}
                  </span>
                </span>

                <span
                  className={
                    expense.type ===
                    "income"
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  {expense.type ===
                  "income"
                    ? "+"
                    : "-"}
                  ₹{expense.amount}
                </span>

              </li>
            ))}

            {recentExpenses.length ===
              0 && (
              <p className="text-sm text-gray-400">
                No expenses logged yet.
              </p>
            )}

          </ul>

        </Card>

      </div>

      {/* ========================= */}
      {/* PINNED NOTES */}
      {/* ========================= */}

      {pinnedNotes.length > 0 && (
        <Card title="Pinned notes">

          <div className="grid md:grid-cols-3 gap-3">

            {pinnedNotes.map((note) => (
              <div
                key={note._id}
                className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-sm"
              >

                <p className="font-medium">
                  {note.title}
                </p>

                <p className="text-gray-500 line-clamp-2">
                  {note.content}
                </p>

              </div>
            ))}

          </div>

        </Card>
      )}

    </div>
  );
}