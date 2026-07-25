import { useState } from "react";
import { Menu, Moon, Sun, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import Modal from "../Common/Modal";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 py-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onMenuClick}
          >
            <Menu size={20} />
          </button>
          <div>
            <p className="text-sm text-gray-400">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="text-lg font-semibold">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
            style={{ backgroundColor: user?.avatarColor || "#6366f1" }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Log out">
        <p className="text-sm text-gray-500 mb-4">Are you sure you want to log out?</p>
        <div className="flex gap-3">
          <button onClick={() => setConfirmOpen(false)} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={() => {
              setConfirmOpen(false);
              handleLogout();
            }}
            className="btn-primary flex-1"
          >
            Log out
          </button>
        </div>
      </Modal>
    </>
  );
}