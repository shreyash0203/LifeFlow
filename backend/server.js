import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

import startTaskScheduler from "./jobs/taskScheduler.js";

import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import startNotificationScheduler from "./jobs/notificationScheduler.js";
import habitRoutes from "./routes/habits.js";
import expenseRoutes from "./routes/expenses.js";
import noteRoutes from "./routes/notes.js";



import dashboardRoutes from "./routes/dashboard.js";
import userRoutes from "./routes/users.js";
import notificationRoutes from "./routes/notifications.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/notes", noteRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Check reminders every 30 seconds

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  startNotificationScheduler();
  
  startTaskScheduler();
});
