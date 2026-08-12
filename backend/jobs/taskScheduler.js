import cron from "node-cron";
import Task from "../models/Task.js";
import Notification from "../models/Notification.js";

const startTaskScheduler = () => {
  // Check every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const tasks = await Task.find({
        dueDate: { $lte: now },
        status: "pending",
        notifiedAt: null,
      });

      for (const task of tasks) {
        await Notification.create({
          user: task.user,
          title: "Task Due 🔔",
          message: `"${task.title}" is due now.`,
          type: "task",
        });

        task.notifiedAt = now;
        await task.save();

        console.log(`🔔 Task notification created: ${task.title}`);
      }
    } catch (error) {
      console.error("Task scheduler error:", error);
    }
  });

  console.log("⏰ Task scheduler started");
};

export default startTaskScheduler;