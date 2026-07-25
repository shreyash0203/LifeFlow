import { useState } from "react";
import { Card } from "../components/Common/Card";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../api/axios";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name || "");
  const [reminderPrefs, setReminderPrefs] = useState(user?.reminderPrefs || { email: true, inApp: true });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");

  const saveProfile = async (e) => {
    e.preventDefault();
    const { data } = await api.put("/users/me", { name, reminderPrefs, theme });
    updateUser(data.user);
    setMessage("Profile updated successfully");
    setTimeout(() => setMessage(""), 2500);
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.put("/users/me/password", passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setMessage("Password changed successfully");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not change password");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold">Settings</h2>
      {message && <p className="text-sm bg-primary-50 dark:bg-primary-500/10 text-primary-700 p-2 rounded-lg">{message}</p>}

      <Card title="Profile">
        <form onSubmit={saveProfile} className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <input className="input opacity-60" value={user?.email} disabled />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Theme</label>
            <select className="input" value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={reminderPrefs.email}
                onChange={(e) => setReminderPrefs({ ...reminderPrefs, email: e.target.checked })}
              />
              Email reminders
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={reminderPrefs.inApp}
                onChange={(e) => setReminderPrefs({ ...reminderPrefs, inApp: e.target.checked })}
              />
              In-app reminders
            </label>
          </div>
          <button type="submit" className="btn-primary">
            Save changes
          </button>
        </form>
      </Card>

      <Card title="Change password">
        <form onSubmit={changePassword} className="space-y-3">
          <input
            type="password"
            placeholder="Current password"
            className="input"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
          />
          <input
            type="password"
            placeholder="New password"
            className="input"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
          />
          <button type="submit" className="btn-secondary">
            Update password
          </button>
        </form>
      </Card>

      <Card title="Household / role">
        <p className="text-sm text-gray-500">
          Current role: <span className="font-medium capitalize">{user?.role}</span>. Shared household/team
          access can be layered on top of this using the <code>householdId</code> field already on the User
          model — invite flow can be added when you're ready to extend this.
        </p>
      </Card>
    </div>
  );
}
