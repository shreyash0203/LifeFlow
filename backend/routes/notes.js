import express from "express";
import { body, validationResult } from "express-validator";
import Note from "../models/Note.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const { search, tag } = req.query;
    const filter = { user: req.user._id };
    if (tag) filter.tags = tag;
    if (search) filter.$text = { $search: search };

    const notes = await Note.find(filter).sort({ pinned: -1, updatedAt: -1 });
    res.json(notes);
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

      const note = await Note.create({ ...req.body, user: req.user._id });
      res.status(201).json(note);
    } catch (err) {
      next(err);
    }
  }
);

router.put("/:id", async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/pin", async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    note.pinned = !note.pinned;
    await note.save();
    res.json(note);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
