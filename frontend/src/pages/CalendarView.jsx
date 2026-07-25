import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "../components/Common/Card";
import api from "../api/axios";

export default function CalendarView() {
  const [cursor, setCursor] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [reminders, setReminders] = useState([]);
const toLocalKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  useEffect(() => {
    Promise.all([api.get("/tasks"), api.get("/reminders")]).then(([t, r]) => {
      setTasks(t.data);
      setReminders(r.data);
    });
  }, []);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [year, month]);

  const eventsFor = (date) => {
  if (!date) return [];
  const key = toLocalKey(date);
  const dayTasks = tasks.filter((t) => t.dueDate && toLocalKey(new Date(t.dueDate)) === key);
  const dayReminders = reminders.filter((r) => toLocalKey(new Date(r.dateTime)) === key);
  return [
    ...dayTasks.map((t) => ({ label: t.title, type: "task" })),
    ...dayReminders.map((r) => ({ label: r.title, type: "reminder" })),
  ];
};

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Calendar</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-medium w-32 text-center">
            {cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-7 gap-2 mb-2 text-xs font-medium text-gray-400 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((date, i) => {
            const events = eventsFor(date);
            const isToday = date && date.toDateString() === new Date().toDateString();
            return (
              <div
                key={i}
                className={`min-h-[80px] rounded-xl border border-gray-100 dark:border-gray-800 p-2 text-xs ${
                  isToday ? "bg-primary-50 dark:bg-primary-500/10 border-primary-200" : ""
                }`}
              >
                {date && <p className="font-medium mb-1">{date.getDate()}</p>}
                {events.slice(0, 2).map((e, idx) => (
                  <p
                    key={idx}
                    className={`truncate rounded px-1 mb-0.5 ${
                      e.type === "task" ? "bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300" : "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300"
                    }`}
                  >
                    {e.label}
                  </p>
                ))}
                {events.length > 2 && <p className="text-gray-400">+{events.length - 2} more</p>}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
