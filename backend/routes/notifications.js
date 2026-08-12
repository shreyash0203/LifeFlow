import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

/*
GET ALL NOTIFICATIONS
*/
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/*
MARK AS READ
*/
router.patch("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        read: true,
      },
      {
        new: true,
      }
    );

    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/*
DELETE
*/
router.delete("/:id", async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    res.json({
      message: "Notification deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

export default router;