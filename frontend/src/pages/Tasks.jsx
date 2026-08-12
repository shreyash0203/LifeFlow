import { useEffect, useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import { Card } from "../components/Common/Card";
import Modal from "../components/Common/Modal";
import api from "../api/axios";

const emptyForm = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
  hour: "",
  minute: "",
  ampm: "AM",
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // FETCH TASKS
  // --------------------------------------------------

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const params = {};

      if (filters.status) {
        params.status = filters.status;
      }

      if (filters.priority) {
        params.priority = filters.priority;
      }

      if (filters.search) {
        params.search = filters.search;
      }

      const { data } = await api.get("/tasks", { params });

      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FETCH WHEN FILTERS CHANGE
  // --------------------------------------------------

  useEffect(() => {
    const t = setTimeout(fetchTasks, 250);

    return () => clearTimeout(t);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // --------------------------------------------------
  // CREATE TASK
  // --------------------------------------------------

  const createTask = async (e) => {
    e.preventDefault();

    try {
      // Check date
      if (!form.dueDate) {
        alert("Please select a due date.");
        return;
      }

      // Check hour
      if (form.hour === "") {
        alert("Please select an hour.");
        return;
      }

      // Check minute
      // IMPORTANT:
      // 00 is valid, so don't use !form.minute
      if (form.minute === "") {
        alert("Please select a minute.");
        return;
      }

      // ----------------------------------------------
      // CONVERT 12-HOUR TIME TO 24-HOUR TIME
      // ----------------------------------------------

      let hour24 = Number(form.hour);

      if (form.ampm === "AM") {
        if (hour24 === 12) {
          hour24 = 0;
        }
      } else {
        if (hour24 !== 12) {
          hour24 += 12;
        }
      }

      // ----------------------------------------------
      // MINUTE
      // ----------------------------------------------

      const minuteValue = Number(form.minute);

      if (minuteValue < 0 || minuteValue > 60) {
        alert("Please select a valid minute.");
        return;
      }

      // ----------------------------------------------
      // CREATE DATE
      // ----------------------------------------------

      const [year, month, day] = form.dueDate
        .split("-")
        .map(Number);

      const selectedDate = new Date(
        year,
        month - 1,
        day,
        hour24,
        minuteValue,
        0,
        0
      );

      // Check date validity
      if (Number.isNaN(selectedDate.getTime())) {
        alert("Invalid date or time.");
        return;
      }

      // ----------------------------------------------
      // SEND TO BACKEND
      // ----------------------------------------------

      const taskData = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        dueDate: selectedDate.toISOString(),
      };

      await api.post("/tasks", taskData);

      // Reset form
      setForm(emptyForm);

      // Close modal
      setModalOpen(false);

      // Refresh tasks
      fetchTasks();
    } catch (error) {
      console.error("Failed to create task:", error);

      alert(
        error.response?.data?.message ||
          "Failed to create task. Please try again."
      );
    }
  };

  // --------------------------------------------------
  // COMPLETE / UNCOMPLETE TASK
  // --------------------------------------------------

  const toggleStatus = async (task) => {
    try {
      await api.put(`/tasks/${task._id}`, {
        status:
          task.status === "completed"
            ? "pending"
            : "completed",
      });

      fetchTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  // --------------------------------------------------
  // DELETE TASK
  // --------------------------------------------------

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);

      fetchTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  // --------------------------------------------------
  // FORMAT DATE + TIME
  // --------------------------------------------------

  const formatDueDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="space-y-5">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

        <h2 className="text-xl font-bold">
          Tasks
        </h2>

        <button
          onClick={() => {
            setForm(emptyForm);
            setModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2 w-fit"
        >
          <Plus size={16} />
          New Task
        </button>

      </div>

      {/* TASK CARD */}

      <Card>

        {/* SEARCH + FILTERS */}

        <div className="flex flex-col md:flex-row gap-3 mb-4">

          {/* SEARCH */}

          <div className="relative flex-1">

            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              className="input pl-9"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  search: e.target.value,
                })
              }
            />

          </div>

          {/* STATUS */}

          <select
            className="input md:w-40"
            value={filters.status}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: e.target.value,
              })
            }
          >
            <option value="">
              All status
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="completed">
              Completed
            </option>
          </select>

          {/* PRIORITY */}

          <select
            className="input md:w-40"
            value={filters.priority}
            onChange={(e) =>
              setFilters({
                ...filters,
                priority: e.target.value,
              })
            }
          >
            <option value="">
              All priorities
            </option>

            <option value="low">
              Low
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="high">
              High
            </option>
          </select>

        </div>

        {/* TASKS */}

        {loading ? (
          <p className="text-gray-400 text-sm">
            Loading tasks...
          </p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No tasks match your filters.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">

            {tasks.map((task) => (
              <li
                key={task._id}
                className="flex items-center justify-between py-3"
              >

                {/* TASK INFORMATION */}

                <div className="flex items-center gap-3">

                  <input
                    type="checkbox"
                    checked={
                      task.status === "completed"
                    }
                    onChange={() =>
                      toggleStatus(task)
                    }
                    className="w-4 h-4 accent-primary-600"
                  />

                  <div>

                    {/* TITLE */}

                    <p
                      className={
                        task.status === "completed"
                          ? "line-through text-gray-400"
                          : "font-medium"
                      }
                    >
                      {task.title}
                    </p>

                    {/* DESCRIPTION */}

                    {task.description && (
                      <p className="text-xs text-gray-400 mt-1">
                        {task.description}
                      </p>
                    )}

                    {/* DATE + TIME */}

                    {task.dueDate && (
                      <p className="text-xs text-gray-400 mt-1">
                        Due:{" "}
                        {formatDueDate(
                          task.dueDate
                        )}
                      </p>
                    )}

                  </div>

                </div>

                {/* PRIORITY + DELETE */}

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

                  <button
                    onClick={() =>
                      deleteTask(task._id)
                    }
                    className="text-gray-400 hover:text-red-500"
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

              </li>
            ))}

          </ul>
        )}

      </Card>

      {/* NEW TASK MODAL */}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Task"
      >

        <form
          onSubmit={createTask}
          className="space-y-3"
        >

          {/* TASK TITLE */}

          <input
            required
            placeholder="Task title"
            className="input"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
          />

          {/* DESCRIPTION */}

          <textarea
            placeholder="Description (optional)"
            className="input"
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />

          {/* PRIORITY */}

          <select
            className="input"
            value={form.priority}
            onChange={(e) =>
              setForm({
                ...form,
                priority: e.target.value,
              })
            }
          >
            <option value="low">
              Low
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="high">
              High
            </option>
          </select>

          {/* DATE */}

          <div>

            <label className="block text-sm font-medium mb-1">
              Due date
            </label>

            <input
              type="date"
              className="input"
              value={form.dueDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  dueDate: e.target.value,
                })
              }
              required
            />

          </div>

          {/* TIME */}

          <div>

            <label className="block text-sm font-medium mb-1">
              Due time
            </label>

            <div className="grid grid-cols-3 gap-2">

              {/* HOUR */}

              <select
                className="input"
                value={form.hour}
                onChange={(e) =>
                  setForm({
                    ...form,
                    hour: e.target.value,
                  })
                }
                required
              >

                <option value="">
                  Hour
                </option>

                {Array.from(
                  { length: 12 },
                  (_, i) => i + 1
                ).map((hour) => (
                  <option
                    key={hour}
                    value={hour}
                  >
                    {String(hour).padStart(2, "0")}
                  </option>
                ))}

              </select>

              {/* MINUTE */}

              <select
                className="input"
                value={form.minute}
                onChange={(e) =>
                  setForm({
                    ...form,
                    minute: e.target.value,
                  })
                }
                required
              >

                <option value="">
                  Minute
                </option>

                {Array.from(
                  { length: 61 },
                  (_, i) => i
                ).map((minute) => (
                  <option
                    key={minute}
                    value={minute}
                  >
                    {String(minute).padStart(2, "0")}
                  </option>
                ))}

              </select>

              {/* AM / PM */}

              <select
                className="input"
                value={form.ampm}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ampm: e.target.value,
                  })
                }
              >

                <option value="AM">
                  AM
                </option>

                <option value="PM">
                  PM
                </option>

              </select>

            </div>

          </div>

          {/* CREATE TASK */}

          <button
            type="submit"
            className="btn-primary w-full"
          >
            Create Task
          </button>

        </form>

      </Modal>

    </div>
  );
}