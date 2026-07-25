import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Flame,
  Wallet,
  StickyNote,
  Bell,
  Calendar,
  Settings,
  Sparkles,
} from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/habits", label: "Habits", icon: Flame },
  { to: "/expenses", label: "Expenses", icon: Wallet },
  { to: "/notes", label: "Notes", icon: StickyNote },
  { to: "/reminders", label: "Reminders", icon: Bell },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-2 px-6 py-5">
          <Sparkles className="text-primary-600" size={22} />
          <span className="font-bold text-lg tracking-tight">LifeFlow</span>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800">
          LifeFlow v1.0 — your personal OS
        </div>
      </aside>
    </>
  );
}
