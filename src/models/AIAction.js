import mongoose from "mongoose";

const aiActionSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: true,
  },
  agentType: { type: String, required: true },
  input: { type: String, required: true },
  output: { type: String },
  executionTime: { type: Number }, // milliseconds
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("AIAction", aiActionSchema);
