export const AI_PROCESSING_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  RETRY: "retry",
};

export const TICKET_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
};

export const ticketSchema = {
  id: "",
  title: "",
  description: "",
  status: TICKET_STATUS.OPEN,
  aiProcessingStatus: AI_PROCESSING_STATUS.PENDING,
  userId: "",
  createdAt: "",
  updatedAt: "",
  aiSummary: "",
  aiCategory: "",
  aiSentiment: "",
  aiSuggestedReply: "",
  knowledgeBaseCitations: [],
};
