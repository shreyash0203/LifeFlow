import { useEffect, useState } from "react";
import { Plus, Trash2, Pin, Search } from "lucide-react";
import { Card } from "../components/Common/Card";
import Modal from "../components/Common/Modal";
import api from "../api/axios";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", tags: "" });

  const fetchNotes = async () => {
    const { data } = await api.get("/notes", { params: search ? { search } : {} });
    setNotes(data);
  };

  useEffect(() => {
    const t = setTimeout(fetchNotes, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const createNote = async (e) => {
    e.preventDefault();
    await api.post("/notes", {
      title: form.title,
      content: form.content,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setForm({ title: "", content: "", tags: "" });
    setModalOpen(false);
    fetchNotes();
  };

  const togglePin = async (id) => {
    await api.patch(`/notes/${id}/pin`);
    fetchNotes();
  };

  const deleteNote = async (id) => {
    await api.delete(`/notes/${id}`);
    fetchNotes();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Notes</h2>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 w-fit">
          <Plus size={16} /> New Note
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-9"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {notes.map((n) => (
          <Card key={n._id} className={n.pinned ? "ring-2 ring-amber-300" : ""}>
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold">{n.title}</h4>
              <div className="flex gap-2">
                <button onClick={() => togglePin(n._id)} className={n.pinned ? "text-amber-500" : "text-gray-300"}>
                  <Pin size={16} />
                </button>
                <button onClick={() => deleteNote(n._id)} className="text-gray-300 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 whitespace-pre-line line-clamp-4">{n.content}</p>
            {n.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {n.tags.map((t) => (
                  <span key={t} className="text-xs bg-primary-50 dark:bg-primary-500/10 text-primary-600 px-2 py-0.5 rounded-full">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </Card>
        ))}
        {notes.length === 0 && <p className="text-gray-400 text-sm">No notes found.</p>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Note">
        <form onSubmit={createNote} className="space-y-3">
          <input
            required
            placeholder="Title"
            className="input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            placeholder="Write your note..."
            rows={5}
            className="input"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <input
            placeholder="Tags (comma separated)"
            className="input"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
          <button type="submit" className="btn-primary w-full">
            Save Note
          </button>
        </form>
      </Modal>
    </div>
  );
}
