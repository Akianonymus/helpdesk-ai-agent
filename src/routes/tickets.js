import express from "express";
import { body, param } from "express-validator";

import Ticket from "../models/Ticket.js";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.js";
import { handleValidationErrors } from "../middleware/validate.js";
import { triggerAIProcessing } from "../agents/aiProcessor.js";

const router = express.Router();

export default function ticketRoutes(io) {
  router.post(
    "/",
    authenticateJWT,
    [
      body("title").isLength({ min: 5 }).trim(),
      body("description").isLength({ min: 10 }).trim(),
    ],
    handleValidationErrors,
    async (req, res) => {
      try {
        console.log(req.body);
        const { title, description } = req.body;
        const ticket = new Ticket({
          title,
          description,
          userId: req.user.id,
          aiProcessingStatus: "pending",
        });
        await ticket.save();

        triggerAIProcessing(io, ticket);

        res.status(201).json(ticket);
      } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error creating ticket" });
      }
    }
  );

  router.get("/", authenticateJWT, async (req, res) => {
    try {
      if (req.user.role === "admin") {
        const tickets = await Ticket.find()
          .populate("userId", "email")
          .populate("assignedTo", "email")
          .sort({ createdAt: -1 });
        return res.json(tickets);
      } else {
        const tickets = await Ticket.find({ userId: req.user.id })
          .populate("assignedTo", "email")
          .sort({ createdAt: -1 });
        return res.json(tickets);
      }
    } catch (err) {
      res.status(500).json({ message: "Server error fetching tickets" });
    }
  });

  router.get(
    "/:id",
    authenticateJWT,
    param("id").isMongoId(),
    handleValidationErrors,
    async (req, res) => {
      try {
        const ticket = await Ticket.findById(req.params.id)
          .populate("userId", "email")
          .populate("assignedTo", "email");
        if (!ticket)
          return res.status(404).json({ message: "Ticket not found" });

        if (
          req.user.role !== "admin" &&
          ticket.userId._id.toString() !== req.user.id
        ) {
          return res.status(403).json({ message: "Access denied" });
        }

        res.json(ticket);
      } catch (err) {
        res.status(500).json({ message: "Server error fetching ticket" });
      }
    }
  );

  router.put(
    "/:id",
    authenticateJWT,
    param("id").isMongoId(),
    body("status").isIn([
      "open",
      "in-progress",
      "closed",
      "ai-processing",
      "ai-completed",
    ]),
    body("assignedTo").optional().isMongoId(),
    handleValidationErrors,
    async (req, res) => {
      try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket)
          return res.status(404).json({ message: "Ticket not found" });

        const updateData = {};
        if (req.body.status) updateData.status = req.body.status;
        if (req.body.assignedTo) updateData.assignedTo = req.body.assignedTo;

        const updatedTicket = await Ticket.findByIdAndUpdate(
          req.params.id,
          updateData,
          { new: true }
        )
          .populate("userId", "email")
          .populate("assignedTo", "email");

        res.json(updatedTicket);
      } catch (err) {
        res.status(500).json({ message: "Server error updating ticket" });
      }
    }
  );

  router.post(
    "/:id/retry-ai",
    authenticateJWT,
    param("id").isMongoId(),
    handleValidationErrors,
    async (req, res) => {
      try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket)
          return res.status(404).json({ message: "Ticket not found" });

        if (
          req.user.role !== "admin" &&
          ticket.userId.toString() !== req.user.id
        ) {
          return res.status(403).json({ message: "Access denied" });
        }

        if (ticket.aiProcessingStatus !== "failed") {
          return res.status(400).json({
            message: "AI processing can only be retried for failed tickets",
          });
        }

        await Ticket.findByIdAndUpdate(ticket._id, {
          aiProcessingStatus: "pending",
          aiProcessingError: null,
          aiProcessingStartedAt: null,
          aiProcessingCompletedAt: null,
          status: "open",
        });

        triggerAIProcessing(io, ticket);

        res.json({
          message: "AI processing restarted successfully",
          ticketId: ticket._id,
        });
      } catch (err) {
        res
          .status(500)
          .json({ message: "Server error retrying AI processing" });
      }
    }
  );

  router.get("/filter/ai-status", authenticateJWT, async (req, res) => {
    try {
      const { status, limit = 20, page = 1 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      let query = {};
      if (status) {
        query.aiProcessingStatus = status;
      }

      if (req.user.role !== "admin") {
        query.userId = req.user.id;
      }

      const tickets = await Ticket.find(query)
        .populate("userId", "email")
        .populate("assignedTo", "email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Ticket.countDocuments(query);

      res.json({
        tickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Server error filtering tickets" });
    }
  });

  return router;
}
