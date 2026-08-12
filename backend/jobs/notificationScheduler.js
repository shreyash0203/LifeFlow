import cron from "node-cron";
import Task from "../models/Task.js";
import Notification from "../models/Notification.js";

const startNotificationScheduler = () => {
  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // =========================
      // TASK NOTIFICATIONS
      // =========================

      const tasks = await Task.find({
        reminderAt: {
          $ne: null,
          $lte: now,
        },
        notifiedAt: null,
        status: { $ne: "completed" },
      });

      for (const task of tasks) {
        await Notification.create({
          user: task.user,
          title: "Task Reminder",
          message: `"${task.title}" is due now.`,
          type: "task",
        });

        task.notifiedAt = now;
        await task.save();
      }

      // =========================
      // REMINDER NOTIFICATIONS
      // =========================

      const reminders = await Reminder.find({
        dateTime: {
          $lte: now,
        },
        notifiedAt: null,
        status: "active",
      });

      for (const reminder of reminders) {
        await Notification.create({
          user: reminder.user,
          title: "Reminder",
          message: `"${reminder.title}" is scheduled now.`,
          type: "reminder",
        });

        reminder.notifiedAt = now;
        await reminder.save();
      }

      if (tasks.length > 0 || reminders.length > 0) {
        console.log(
          `🔔 Notifications created: ${tasks.length} tasks, ${reminders.length} reminders`
        );
      }
    } catch (error) {
      console.error("Notification scheduler error:", error);
    }
  });

  console.log("🔔 Notification scheduler started");
};

export default startNotificationScheduler;