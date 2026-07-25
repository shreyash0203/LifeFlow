import { useEffect, useState } from "react";
import { CheckSquare, Flame, Wallet, Bell, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, StatCard } from "../components/Common/Card";
import api from "../api/axios";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard")
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400">Loading your dashboard...</p>;
  if (!data) return <p className="text-gray-400">Could not load dashboard data.</p>;

  const { todayTasks, taskStats, habits, recentExpenses, monthSummary, upcomingReminders, pinnedNotes, insights } = data;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Tasks today" value={todayTasks.length} icon={<CheckSquare />} />
        <StatCard label="Active habits" value={habits.length} icon={<Flame />} accent="text-orange-500" />
        <StatCard
          label="Month balance"
          value={`₹${monthSummary.balance.toLocaleString()}`}
          icon={<Wallet />}
          accent={monthSummary.balance >= 0 ? "text-green-600" : "text-red-500"}
        />
        <StatCard label="Upcoming reminders" value={upcomingReminders.length} icon={<Bell />} accent="text-purple-500" />
      </div>

      {/* Smart insights */}
      <Card title="Smart insights">
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <TrendingUp className="text-primary-600 mt-0.5" size={18} />
            <div>
              <p className="font-medium">Most productive day</p>
              <p className="text-gray-500">{insights.mostProductiveDay}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Wallet className="text-amber-500 mt-0.5" size={18} />
            <div>
              <p className="font-medium">Highest spending category</p>
              <p className="text-gray-500">
                {insights.highestSpendingCategory
                  ? `${insights.highestSpendingCategory.category} — ₹${insights.highestSpendingCategory.amount.toLocaleString()}`
                  : "No expenses yet"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-500 mt-0.5" size={18} />
            <div>
              <p className="font-medium">Habit streak risk</p>
              <p className="text-gray-500">
                {insights.habitsAtRisk.length
                  ? insights.habitsAtRisk.map((h) => h.name).join(", ")
                  : "All streaks are safe today 🎉"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Today's tasks">
          {todayTasks.length === 0 && <p className="text-sm text-gray-400">Nothing due today. Enjoy the calm.</p>}
          <ul className="space-y-2">
            {todayTasks.map((t) => (
              <li key={t._id} className="flex items-center justify-between text-sm">
                <span className={t.status === "completed" ? "line-through text-gray-400" : ""}>{t.title}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    t.priority === "high"
                      ? "bg-red-100 text-red-600 dark:bg-red-500/10"
                      : t.priority === "medium"
                      ? "bg-amber-100 text-amber-600 dark:bg-amber-500/10"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                  }`}
                >
                  {t.priority}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400 mt-3">
            {taskStats.completed}/{taskStats.total} tasks completed overall
          </p>
        </Card>

        <Card title="Habit streaks">
          <ul className="space-y-3">
            {habits.map((h) => (
              <li key={h._id} className="flex items-center justify-between text-sm">
                <span>
                  {h.icon} {h.name}
                </span>
                <span className="flex items-center gap-1 text-orange-500 font-medium">
                  🔥 {h.currentStreak}d {h.checkedToday && <span className="text-green-500 ml-1">✓</span>}
                </span>
              </li>
            ))}
            {habits.length === 0 && <p className="text-sm text-gray-400">No habits yet — add one to start a streak.</p>}
          </ul>
        </Card>

        <Card title="Recent expenses">
          <ul className="space-y-2">
            {recentExpenses.map((e) => (
              <li key={e._id} className="flex items-center justify-between text-sm">
                <span>
                  {e.category} <span className="text-gray-400">— {e.note}</span>
                </span>
                <span className={e.type === "income" ? "text-green-600" : "text-red-500"}>
                  {e.type === "income" ? "+" : "-"}₹{e.amount}
                </span>
              </li>
            ))}
            {recentExpenses.length === 0 && <p className="text-sm text-gray-400">No expenses logged yet.</p>}
          </ul>
        </Card>

        <Card title="Upcoming reminders">
          <ul className="space-y-2">
            {upcomingReminders.map((r) => (
              <li key={r._id} className="flex items-center justify-between text-sm">
                <span>{r.title}</span>
                <span className="text-xs text-gray-400">{new Date(r.dateTime).toLocaleString()}</span>
              </li>
            ))}
            {upcomingReminders.length === 0 && <p className="text-sm text-gray-400">Nothing on the horizon.</p>}
          </ul>
        </Card>
      </div>

      {pinnedNotes.length > 0 && (
        <Card title="Pinned notes">
          <div className="grid md:grid-cols-3 gap-3">
            {pinnedNotes.map((n) => (
              <div key={n._id} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-sm">
                <p className="font-medium">{n.title}</p>
                <p className="text-gray-500 line-clamp-2">{n.content}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
