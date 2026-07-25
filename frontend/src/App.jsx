import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Habits from "./pages/Habits";
import Expenses from "./pages/Expenses";
import Notes from "./pages/Notes";
import Reminders from "./pages/Reminders";
import CalendarView from "./pages/CalendarView";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="habits" element={<Habits />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="notes" element={<Notes />} />
        <Route path="reminders" element={<Reminders />} />
        <Route path="calendar" element={<CalendarView />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
