import { useEffect, useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { Card } from "../components/Common/Card";
import Modal from "../components/Common/Modal";
import api from "../api/axios";

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", notes: "", dateTime: "", recurrence: "none" });

  const fetchReminders = async () => {
    const { data } = await api.get("/reminders");
    setReminders(data);
  };

  useEffect(() => {
    fetchReminders();
  }, []);

 const createReminder = async (e) => {
  e.preventDefault();
  await api.post("/reminders", form); // form.dateTime is "YYYY-MM-DD", sent as-is
  setForm({ title: "", notes: "", dateTime: "", recurrence: "none" });
  setModalOpen(false);
  fetchReminders();
};

  const completeReminder = async (id) => {
    await api.patch(`/reminders/${id}/complete`);
    fetchReminders();
  };

  const deleteReminder = async (id) => {
    await api.delete(`/reminders/${id}`);
    fetchReminders();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Reminders</h2>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Reminder
        </button>
      </div>

      <Card>
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {reminders.map((r) => (
            <li key={r._id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className={`font-medium ${r.status === "done" ? "line-through text-gray-400" : ""}`}>{r.title}</p>
              <p className="text-xs text-gray-400">
                {new Date(r.dateTime).toLocaleDateString()} {r.recurrence !== "none" && `· repeats ${r.recurrence}`}
              </p>
              </div>
              <div className="flex items-center gap-3">
                {r.status !== "done" && (
                  <button onClick={() => completeReminder(r._id)} className="text-green-500 hover:text-green-600">
                    <Check size={18} />
                  </button>
                )}
                <button onClick={() => deleteReminder(r._id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
          {reminders.length === 0 && <p className="text-gray-400 text-sm py-3">No reminders set.</p>}
        </ul>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Reminder">
        <form onSubmit={createReminder} className="space-y-3">
          <input
            required
            placeholder="Title"
            className="input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            placeholder="Notes (optional)"
            className="input"
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <input
            type="date"
            required
            className="input"
            value={form.dateTime}
            onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
          />
          <select
            className="input"
            value={form.recurrence}
            onChange={(e) => setForm({ ...form, recurrence: e.target.value })}
          >
            <option value="none">One-time</option>
            <option value="daily">Repeats daily</option>
            <option value="weekly">Repeats weekly</option>
            <option value="monthly">Repeats monthly</option>
          </select>
          <button type="submit" className="btn-primary w-full">
            Save Reminder
          </button>
        </form>
      </Modal>
    </div>
  );
}
