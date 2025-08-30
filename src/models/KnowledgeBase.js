import mongoose from "mongoose";

const knowledgeBaseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    category: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Admin only
  },
  { timestamps: true },
);

// Simple text search index for title and content and tags
knowledgeBaseSchema.index({
  title: "text",
  content: "text",
  tags: "text",
  category: "text",
});

export default mongoose.model("KnowledgeBase", knowledgeBaseSchema);
