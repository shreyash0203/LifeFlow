import express from "express";
import { body, validationResult } from "express-validator";
import Task from "../models/Task.js";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// GET /api/tasks?status=&priority=&search=&sort=
router.get("/", async (req, res, next) => {
  try {
    const { status, priority, search, sort } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) filter.$text = { $search: search };

    let query = Task.find(filter);
    query = sort === "dueDate" ? query.sort({ dueDate: 1 }) : query.sort({ createdAt: -1 });

    const tasks = await query;
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  [body("title").trim().notEmpty().withMessage("Title is required")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

      const task = await Task.create({
  ...req.body,
  user: req.user._id,
});

// Create Notification
await Notification.create({
  user: req.user._id,
  title: "New Task Created",
  message: `"${task.title}" has been added successfully.`,
  type: "task",
});

res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  }
);

router.put("/:id", async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.status === "completed") updates.completedAt = new Date();
    if (updates.status === "pending") updates.completedAt = null;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    // Create notification when task is completed
    if (updates.status === "completed") {
    await Notification.create({
    user: req.user._id,
    title: "Task Completed",
    message: `"${task.title}" has been completed successfully.`,
    type: "task",
  });
}
    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });
    await Notification.create({
    user: req.user._id,
    title: "Task Deleted",
    message: `"${task.title}" has been deleted.`,
    type: "task",
});
    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
