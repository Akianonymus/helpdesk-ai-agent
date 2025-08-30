import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "in-progress", "closed", "ai-processing", "ai-completed"],
      default: "open",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    aiSummary: { type: String },
    aiCategory: { type: String },
    aiSentiment: { type: String },
    aiSuggestedReply: { type: String },
    aiCitations: [
      {
        articleId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "KnowledgeBase",
        },
        title: { type: String },
        category: { type: String },
        snippet: { type: String },
      },
    ],
    aiProcessingStatus: {
      type: String,
      enum: ["pending", "in-progress", "completed", "failed"],
      default: "pending",
    },
    aiProcessingStartedAt: { type: Date },
    aiProcessingCompletedAt: { type: Date },
    aiProcessingError: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);
