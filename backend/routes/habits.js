import express from "express";
import { body, validationResult } from "express-validator";
import Habit from "../models/Habit.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

const todayStr = () => new Date().toISOString().slice(0, 10);
const dateStr = (d) => new Date(d).toISOString().slice(0, 10);

// Recompute current + best streak from sorted checkIns
function computeStreaks(checkIns) {
  if (!checkIns.length) return { currentStreak: 0, bestStreak: 0 };
  const dates = [...new Set(checkIns.map((c) => c.date))].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffDays = Math.round((curr - prev) / 86400000);
    run = diffDays === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  // current streak: check backwards from today/yesterday
  const set = new Set(dates);
  let current = 0;
  let cursor = new Date();
  // allow today OR yesterday as the streak anchor so it doesn't reset at midnight instantly
  if (!set.has(todayStr())) cursor.setDate(cursor.getDate() - 1);
  while (set.has(dateStr(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { currentStreak: current, bestStreak: Math.max(best, current) };
}

router.get("/", async (req, res, next) => {
  try {
    const habits = await Habit.find({ user: req.user._id, archived: false }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  [body("name").trim().notEmpty().withMessage("Habit name is required")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

      const habit = await Habit.create({ ...req.body, user: req.user._id });
      res.status(201).json(habit);
    } catch (err) {
      next(err);
    }
  }
);

// Toggle today's check-in
router.post("/:id/checkin", async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    const today = todayStr();
    const alreadyChecked = habit.checkIns.some((c) => c.date === today);

    if (alreadyChecked) {
      habit.checkIns = habit.checkIns.filter((c) => c.date !== today);
    } else {
      habit.checkIns.push({ date: today });
    }

    const { currentStreak, bestStreak } = computeStreaks(habit.checkIns);
    habit.currentStreak = currentStreak;
    habit.bestStreak = bestStreak;
    await habit.save();
    res.json(habit);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!habit) return res.status(404).json({ message: "Habit not found" });
    res.json(habit);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: "Habit not found" });
    res.json({ message: "Habit deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
