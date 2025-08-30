import express from "express";
import { param } from "express-validator";

import AIAction from "../models/AIAction.js";
import Ticket from "../models/Ticket.js";
import { handleValidationErrors } from "../middleware/validate.js";

const router = express.Router();

router.get(
  "/:ticketId",
  param("ticketId").isMongoId(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const ticketId = req.params.ticketId;
      // Ensure current user owns the ticket or is admin
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) return res.status(404).json({ message: "Ticket not found" });

      const user = req.user;
      if (user.role !== "admin" && ticket.userId.toString() !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const actions = await AIAction.find({ ticketId }).sort({ createdAt: 1 });
      res.json(actions);
    } catch (err) {
      res.status(500).json({ message: "Server error fetching AI actions" });
    }
  }
);

export default router;
