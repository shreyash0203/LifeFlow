import { useEffect, useState } from "react";
import { Plus, Trash2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card } from "../components/Common/Card";
import Modal from "../components/Common/Modal";
import api from "../api/axios";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];
const monthLabel = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const shiftMonth = (ym, delta) => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [form, setForm] = useState({ type: "expense", amount: "", category: "", note: "", date: new Date().toISOString().slice(0, 10) });

  const fetchAll = async () => {
    const [{ data: exp }, { data: sum }] = await Promise.all([
    api.get("/expenses", { params: { month } }),
    api.get("/expenses/summary", { params: { month } }),
    ]);
    setExpenses(exp);
    setSummary(sum);
  };

  useEffect(() => {
    fetchAll();
  }, [month]);

  const createExpense = async (e) => {
    e.preventDefault();
    await api.post("/expenses", { ...form, amount: parseFloat(form.amount) });
    setForm({ type: "expense", amount: "", category: "", note: "", date: new Date().toISOString().slice(0, 10) });
    setModalOpen(false);
    fetchAll();
  };

  const deleteExpense = async (id) => {
    await api.delete(`/expenses/${id}`);
    fetchAll();
  };

  const exportCsv = async () => {
    const res = await api.get("/expenses/export/csv", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "lifeflow-expenses.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const pieData = summary ? Object.entries(summary.byCategory).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Expenses</h2>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="btn-secondary flex items-center gap-2">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Entry
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 w-fit">
        <button
          onClick={() => setMonth((m) => shiftMonth(m, -1))}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-medium w-40 text-center">{monthLabel(month)}</span>
        <button
          onClick={() => setMonth((m) => shiftMonth(m, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-gray-500">Income</p>
            <p className="text-xl font-bold text-green-600">₹{summary.totals.income.toLocaleString()}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Expense</p>
            <p className="text-xl font-bold text-red-500">₹{summary.totals.expense.toLocaleString()}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Balance</p>
            <p className={`text-xl font-bold ${summary.balance >= 0 ? "text-green-600" : "text-red-500"}`}>
              ₹{summary.balance.toLocaleString()}
            </p>
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Spending by category">
          {pieData.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">No expense data this month yet.</p>
          )}
        </Card>

        <Card title="Category totals">
          {pieData.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">Nothing to chart yet.</p>
          )}
        </Card>
      </div>

      <Card title="All transactions">
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {expenses.map((e) => (
            <li key={e._id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium">{e.category}</p>
                <p className="text-xs text-gray-400">
                  {new Date(e.date).toLocaleDateString()} {e.note && `· ${e.note}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={e.type === "income" ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                  {e.type === "income" ? "+" : "-"}₹{e.amount}
                </span>
                <button onClick={() => deleteExpense(e._id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
          {expenses.length === 0 && <p className="text-gray-400 text-sm py-3">No transactions yet.</p>}
        </ul>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Entry">
        <form onSubmit={createExpense} className="space-y-3">
          <div className="flex gap-3">
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input
              type="number"
              step="0.01"
              required
              placeholder="Amount"
              className="input"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <input
            required
            placeholder="Category (e.g. Groceries)"
            className="input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <input
            placeholder="Note (optional)"
            className="input"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
          <input
            type="date"
            className="input"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <button type="submit" className="btn-primary w-full">
            Save
          </button>
        </form>
      </Modal>
    </div>
  );
}
