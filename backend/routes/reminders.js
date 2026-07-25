import express from "express";
import { body, validationResult } from "express-validator";
import Reminder from "../models/Reminder.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const { upcoming } = req.query;
    const filter = { user: req.user._id };
    if (upcoming === "true") {
      filter.dateTime = { $gte: new Date() };
      filter.status = "active";
    }
    const reminders = await Reminder.find(filter).sort({ dateTime: 1 });
    res.json(reminders);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("dateTime").isISO8601().withMessage("Valid date/time is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

      const reminder = await Reminder.create({ ...req.body, user: req.user._id });
      res.status(201).json(reminder);
    } catch (err) {
      next(err);
    }
  }
);

router.put("/:id", async (req, res, next) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.json(reminder);
  } catch (err) {
    next(err);
  }
});

// Mark done -- if recurring, roll the date forward instead of just closing it
router.patch("/:id/complete", async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user._id });
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });

    if (reminder.recurrence === "none") {
      reminder.status = "done";
    } else {
      const next = new Date(reminder.dateTime);
      if (reminder.recurrence === "daily") next.setDate(next.getDate() + 1);
      if (reminder.recurrence === "weekly") next.setDate(next.getDate() + 7);
      if (reminder.recurrence === "monthly") next.setMonth(next.getMonth() + 1);
      reminder.dateTime = next;
      reminder.notifiedAt = null;
    }
    await reminder.save();
    res.json(reminder);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.json({ message: "Reminder deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
