import AIAction from "../models/AIAction.js";
import KnowledgeBase from "../models/KnowledgeBase.js";
import Ticket from "../models/Ticket.js";
import { GoogleGenAI } from "@google/genai";
import { SECRETS } from "../utils/consts.js";

const aiClient = new GoogleGenAI({ apiKey: SECRETS.GEMINI_API_KEY });

const AGENTS = {
  SUMMARIZER: "SummarizerAgent",
  CLASSIFIER: "ClassifierAgent",
  SENTIMENT: "SentimentAgent",
  RESEARCHER: "ResearchAgent",
  REPLY_WRITER: "ReplyWriterAgent",
};

function emitToTicket(io, ticketId, event, data) {
  const roomName = getTicketRoomName(ticketId);
  const clientCount = getTicketRoomClients(io, ticketId);

  if (clientCount > 0) {
    io.to(roomName).emit(event, data);
    console.log(
      `Emitted ${event} to room ${roomName} (${clientCount} clients)`
    );
  } else {
    console.log(`No clients in room ${roomName} for event ${event}`);
  }
}

function emitProgress(io, ticketId, agentType, status, data = {}) {
  emitToTicket(io, ticketId, "agent-progress", {
    ticketId,
    agentType,
    status,
    timestamp: new Date().toISOString(),
    ...data,
  });
}

function getTicketRoomName(ticketId) {
  return `ticket-${ticketId}`;
}

function getTicketRoomClients(io, ticketId) {
  const roomName = getTicketRoomName(ticketId);
  const room = io.sockets.adapter.rooms.get(roomName);
  return room ? room.size : 0;
}

async function recordAIAction(
  ticketId,
  agentType,
  input,
  output,
  executionTime
) {
  const action = new AIAction({
    ticketId,
    agentType,
    input,
    output,
    executionTime,
  });
  await action.save();
}

async function updateTicketStatus(ticketId, status, additionalFields = {}) {
  const updateData = {
    aiProcessingStatus: status,
    ...additionalFields,
  };

  if (status === "in-progress" && !additionalFields.aiProcessingStartedAt) {
    updateData.aiProcessingStartedAt = new Date();
  } else if (status === "completed") {
    updateData.aiProcessingCompletedAt = new Date();
  }

  await Ticket.findByIdAndUpdate(ticketId, updateData);
}

async function SummarizerAgent(io, ticket) {
  const agentType = AGENTS.SUMMARIZER;
  emitToTicket(io, ticket._id, "agent-started", {
    ticketId: ticket._id,
    agentType,
    status: "started",
  });

  const input = ticket.description;
  const startTime = Date.now();

  try {
    const prompt = `Summarize the following support ticket description briefly:\n\n${input}\n\nSummary:`;
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: prompt }],
    });

    const output = response.text.trim();
    const execTime = Date.now() - startTime;

    await recordAIAction(ticket._id, agentType, input, output, execTime);

    await Ticket.findByIdAndUpdate(ticket._id, { aiSummary: output });

    emitToTicket(io, ticket._id, "agent-completed", {
      ticketId: ticket._id,
      agentType,
      result: output,
      status: "completed",
    });

    return output;
  } catch (error) {
    await recordAIAction(
      ticket._id,
      agentType,
      input,
      `Error: ${error.message}`,
      Date.now() - startTime
    );
    throw error;
  }
}

async function ClassifierAgent(io, ticket) {
  const agentType = AGENTS.CLASSIFIER;
  emitToTicket(io, ticket._id, "agent-started", {
    ticketId: ticket._id,
    agentType,
    status: "started",
  });

  const input = ticket.description;
  const startTime = Date.now();
  const categories = ["technical", "billing", "general", "urgent"];

  try {
    const prompt = `Classify the following support ticket description into one of categories: ${categories.join(
      ", "
    )}.\n\nTicket description:\n${input}\nClassification:`;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: prompt }],
    });

    let output = response.text.trim().toLowerCase();
    if (!categories.includes(output)) {
      // fallback default
      output = "general";
    }
    const execTime = Date.now() - startTime;

    await recordAIAction(ticket._id, agentType, input, output, execTime);

    await Ticket.findByIdAndUpdate(ticket._id, { aiCategory: output });

    emitToTicket(io, ticket._id, "agent-completed", {
      ticketId: ticket._id,
      agentType,
      result: output,
      status: "completed",
    });

    return output;
  } catch (error) {
    await recordAIAction(
      ticket._id,
      agentType,
      input,
      `Error: ${error.message}`,
      Date.now() - startTime
    );
    throw error;
  }
}

async function SentimentAgent(io, ticket) {
  const agentType = AGENTS.SENTIMENT;
  emitToTicket(io, ticket._id, "agent-started", {
    ticketId: ticket._id,
    agentType,
    status: "started",
  });

  const input = ticket.description;
  const startTime = Date.now();
  const sentiments = ["positive", "neutral", "negative", "frustrated"];

  try {
    const prompt = `Detect the sentiment of the following customer support ticket description. Choose one: ${sentiments.join(
      ", "
    )}.\n\nDescription:\n${input}\nSentiment:`;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: prompt }],
    });

    let output = response.text.trim().toLowerCase();
    if (!sentiments.includes(output)) {
      output = "neutral";
    }
    const execTime = Date.now() - startTime;

    await recordAIAction(ticket._id, agentType, input, output, execTime);

    await Ticket.findByIdAndUpdate(ticket._id, { aiSentiment: output });

    emitToTicket(io, ticket._id, "agent-completed", {
      ticketId: ticket._id,
      agentType,
      result: output,
      status: "completed",
    });

    return output;
  } catch (error) {
    await recordAIAction(
      ticket._id,
      agentType,
      input,
      `Error: ${error.message}`,
      Date.now() - startTime
    );
    throw error;
  }
}

async function ResearchAgent(io, ticket) {
  const agentType = AGENTS.RESEARCHER;
  emitToTicket(io, ticket._id, "agent-started", {
    ticketId: ticket._id,
    agentType,
    status: "started",
  });

  const input = ticket.description;
  const startTime = Date.now();

  try {
    const articles = await KnowledgeBase.find({ $text: { $search: input } })
      .sort({ score: { $meta: "textScore" } })
      .limit(3)
      .select("title content tags category");

    const output = articles.map((art) => ({
      id: art._id,
      title: art.title,
      category: art.category,
      snippet:
        art.content.slice(0, 200) + (art.content.length > 200 ? "..." : ""),
    }));

    const execTime = Date.now() - startTime;

    await recordAIAction(
      ticket._id,
      agentType,
      input,
      JSON.stringify(output),
      execTime
    );

    await Ticket.findByIdAndUpdate(ticket._id, {
      aiCitations: output.map((art) => ({
        articleId: art.id,
        title: art.title,
        category: art.category,
        snippet: art.snippet,
      })),
    });

    emitToTicket(io, ticket._id, "agent-completed", {
      ticketId: ticket._id,
      agentType,
      result: output,
      status: "completed",
    });

    return output;
  } catch (error) {
    await recordAIAction(
      ticket._id,
      agentType,
      input,
      `Error: ${error.message}`,
      Date.now() - startTime
    );
    throw error;
  }
}

async function ReplyWriterAgent(
  io,
  ticket,
  summary,
  category,
  sentiment,
  kbArticles
) {
  const agentType = AGENTS.REPLY_WRITER;
  emitToTicket(io, ticket._id, "agent-started", {
    ticketId: ticket._id,
    agentType,
    status: "started",
  });

  const kbCitations = kbArticles
    .map((a, i) => `[${i + 1}] ${a.title} (${a.category})`)
    .join("\n");

  const input = `Ticket summary: ${summary}\nCategory: ${category}\nCustomer sentiment: ${sentiment}\n\nRelevant articles:\n${kbCitations}\n\nPlease draft a professional customer support reply incorporating citations from the articles above where suitable. 

IMPORTANT REQUIREMENTS:
- Write as if you are the support agent directly addressing the customer
- Do not use placeholders like [Customer Name], [Your Name], [Agent Name], [Company Name], [Date], or [Time]
- Do not use markdown formatting like ** or * or # or backticks
- Write in plain text format only
- Keep the tone professional but friendly
- Make sure the reply is actionable and helpful
- Use the citations from the knowledge base articles when relevant
- Add Proper Spacing between paragraphs`;

  const startTime = Date.now();

  try {
    let fullReply = "";

    const stream = await aiClient.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: [{ text: input }],
    });

    for await (const part of stream) {
      const chunk = part.text || "";
      fullReply += chunk;
      emitToTicket(io, ticket._id, "reply-streaming", {
        ticketId: ticket._id,
        chunk,
      });
    }

    const execTime = Date.now() - startTime;
    await recordAIAction(ticket._id, agentType, input, fullReply, execTime);

    await Ticket.findByIdAndUpdate(ticket._id, {
      aiSuggestedReply: fullReply,
    });

    emitToTicket(io, ticket._id, "agent-completed", {
      ticketId: ticket._id,
      agentType,
      result: fullReply,
      status: "completed",
    });

    return fullReply;
  } catch (error) {
    await recordAIAction(
      ticket._id,
      agentType,
      input,
      `Error: ${error.message}`,
      Date.now() - startTime
    );
    throw error;
  }
}

export async function runAIAgents(io, ticket) {
  try {
    emitToTicket(io, ticket._id, "ai-processing-started", {
      ticketId: ticket._id,
      timestamp: new Date().toISOString(),
      message: "AI processing pipeline started",
    });

    await updateTicketStatus(ticket._id, "in-progress");

    await Ticket.findByIdAndUpdate(ticket._id, {
      status: "ai-processing",
      aiProcessingStatus: "in-progress",
      aiProcessingStartedAt: new Date(),
    });

    emitProgress(io, ticket._id, "pipeline", "started", {
      step: 1,
      total: 5,
      message: "Starting Summarizer Agent",
    });
    const summary = await SummarizerAgent(io, ticket);

    emitProgress(io, ticket._id, "pipeline", "progress", {
      step: 2,
      total: 5,
      message: "Starting Classifier Agent",
    });
    const category = await ClassifierAgent(io, ticket);

    emitProgress(io, ticket._id, "pipeline", "progress", {
      step: 3,
      total: 5,
      message: "Starting Sentiment Agent",
    });
    const sentiment = await SentimentAgent(io, ticket);

    emitProgress(io, ticket._id, "pipeline", "progress", {
      step: 4,
      total: 5,
      message: "Starting Research Agent",
    });
    const kbArticles = await ResearchAgent(io, ticket);

    emitProgress(io, ticket._id, "pipeline", "progress", {
      step: 5,
      total: 5,
      message: "Starting Reply Writer Agent",
    });
    const suggestedReply = await ReplyWriterAgent(
      io,
      ticket,
      summary,
      category,
      sentiment,
      kbArticles
    );

    await Ticket.findByIdAndUpdate(ticket._id, {
      status: "ai-completed",
      aiProcessingStatus: "completed",
      aiProcessingCompletedAt: new Date(),
    });

    emitProgress(io, ticket._id, "pipeline", "completed", {
      step: 5,
      total: 5,
      message: "AI processing completed successfully",
    });

    emitToTicket(io, ticket._id, "processing-complete", {
      ticketId: ticket._id,
      summary,
      category,
      sentiment,
      suggestedReply,
      citations: kbArticles.map((a, i) => ({
        index: i + 1,
        title: a.title,
        category: a.category,
      })),
    });
  } catch (err) {
    console.error("AI agents processing error:", err);

    await Ticket.findByIdAndUpdate(ticket._id, {
      aiProcessingStatus: "failed",
      aiProcessingError: err.message,
      aiProcessingCompletedAt: new Date(),
    });

    emitToTicket(io, ticket._id, "processing-error", {
      ticketId: ticket._id,
      error: err.message,
    });
  }
}

export function initSocketAIProcessing(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-ticket", (ticketId) => {
      const roomName = `ticket-${ticketId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room: ${roomName}`);

      socket.emit("ticket-room-joined", {
        ticketId,
        roomName,
        message: `Joined ticket room: ${roomName}`,
      });
    });

    socket.on("leave-ticket", (ticketId) => {
      const roomName = `ticket-${ticketId}`;
      socket.leave(roomName);
      console.log(`Socket ${socket.id} left room: ${roomName}`);

      socket.emit("ticket-room-left", {
        ticketId,
        roomName,
        message: `Left ticket room: ${roomName}`,
      });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

export function triggerAIProcessing(io, ticket) {
  const roomName = getTicketRoomName(ticket._id);
  const clientCount = getTicketRoomClients(io, ticket._id);

  console.log(`Triggering AI processing for ticket ${ticket._id}`);
  console.log(`Room ${roomName} has ${clientCount} clients`);

  runAIAgents(io, ticket);
}
