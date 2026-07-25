import { useEffect, useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import { Card } from "../components/Common/Card";
import Modal from "../components/Common/Modal";
import api from "../api/axios";

const emptyForm = { title: "", description: "", priority: "medium", dueDate: "" };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ status: "", priority: "", search: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.search) params.search = filters.search;
    const { data } = await api.get("/tasks", { params });
    setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(fetchTasks, 250); // debounce search
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const createTask = async (e) => {
    e.preventDefault();
    await api.post("/tasks", form);
    setForm(emptyForm);
    setModalOpen(false);
    fetchTasks();
  };

  const toggleStatus = async (task) => {
    await api.put(`/tasks/${task._id}`, {
      status: task.status === "completed" ? "pending" : "completed",
    });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    fetchTasks();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Tasks</h2>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 w-fit">
          <Plus size={16} /> New Task
        </button>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <select
            className="input md:w-40"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <select
            className="input md:w-40"
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-400 text-sm">No tasks match your filters.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {tasks.map((task) => (
              <li key={task._id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.status === "completed"}
                    onChange={() => toggleStatus(task)}
                    className="w-4 h-4 accent-primary-600"
                  />
                  <div>
                    <p className={task.status === "completed" ? "line-through text-gray-400" : "font-medium"}>
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <p className="text-xs text-gray-400">Due {new Date(task.dueDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      task.priority === "high"
                        ? "bg-red-100 text-red-600 dark:bg-red-500/10"
                        : task.priority === "medium"
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-500/10"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                    }`}
                  >
                    {task.priority}
                  </span>
                  <button onClick={() => deleteTask(task._id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Task">
        <form onSubmit={createTask} className="space-y-3">
          <input
            required
            placeholder="Task title"
            className="input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            placeholder="Description (optional)"
            className="input"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex gap-3">
            <select
              className="input"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              type="date"
              className="input"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Create Task
          </button>
        </form>
      </Modal>
    </div>
  );
}
