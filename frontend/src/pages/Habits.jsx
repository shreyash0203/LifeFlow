import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "../components/Common/Card";
import Modal from "../components/Common/Modal";
import api from "../api/axios";

function lastSevenDays() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", icon: "🔥", frequency: "daily" });
  const week = lastSevenDays();

  const fetchHabits = async () => {
    const { data } = await api.get("/habits");
    setHabits(data);
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const createHabit = async (e) => {
    e.preventDefault();
    await api.post("/habits", form);
    setForm({ name: "", icon: "🔥", frequency: "daily" });
    setModalOpen(false);
    fetchHabits();
  };

  const checkIn = async (id) => {
    await api.post(`/habits/${id}/checkin`);
    fetchHabits();
  };

  const deleteHabit = async (id) => {
    await api.delete(`/habits/${id}`);
    fetchHabits();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Habits</h2>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Habit
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {habits.map((h) => (
          <Card key={h._id}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold">
                  {h.icon} {h.name}
                </p>
                <p className="text-xs text-gray-400">
                  🔥 {h.currentStreak} day streak · best {h.bestStreak}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => checkIn(h._id)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium ${
                    h.checkIns?.some((c) => c.date === new Date().toISOString().slice(0, 10))
                      ? "bg-green-100 text-green-700 dark:bg-green-500/10"
                      : "btn-primary"
                  }`}
                >
                  {h.checkIns?.some((c) => c.date === new Date().toISOString().slice(0, 10))
                    ? "Checked ✓"
                    : "Check in"}
                </button>
                <button onClick={() => deleteHabit(h._id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              {week.map((day) => {
                const done = h.checkIns?.some((c) => c.date === day);
                return (
                  <div
                    key={day}
                    className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs ${
                      done
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                    }`}
                    title={day}
                  >
                    {new Date(day).toLocaleDateString("en-US", { weekday: "narrow" })}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
        {habits.length === 0 && <p className="text-gray-400 text-sm">No habits yet. Add your first one!</p>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Habit">
        <form onSubmit={createHabit} className="space-y-3">
          <input
            required
            placeholder="Habit name (e.g. Drink water)"
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div className="flex gap-3">
            <input
              placeholder="Icon (emoji)"
              className="input w-24"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            />
            <select
              className="input"
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">
            Create Habit
          </button>
        </form>
      </Modal>
    </div>
  );
}
