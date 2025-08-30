import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import socketManager from "../api/socket.js";
import { useAuth } from "./AuthContext.jsx";

const AIProcessingContext = createContext();

export const useAIProcessing = () => {
  const context = useContext(AIProcessingContext);
  if (!context) {
    throw new Error(
      "useAIProcessing must be used within an AIProcessingProvider",
    );
  }
  return context;
};

export const AIProcessingProvider = ({ children }) => {
  const [socketConnected, setSocketConnected] = useState(false);
  const [aiProcessingTickets, setAIProcessingTickets] = useState(new Map());
  const [streamingReplies, setStreamingReplies] = useState(new Map());
  const { user } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      socketManager.connect();

      // Set up connection status listeners
      const handleConnect = () => {
        console.log("Socket connected, setting up AI listeners...");
        setSocketConnected(true);
        // Set up AI processing event listeners only after connection
        setupAIEventListeners();
      };
      const handleDisconnect = () => {
        console.log("Socket disconnected");
        setSocketConnected(false);
      };

      socketManager.socket.on("connect", handleConnect);
      socketManager.socket.on("disconnect", handleDisconnect);

      return () => {
        socketManager.socket.off("connect", handleConnect);
        socketManager.socket.off("disconnect", handleDisconnect);
        socketManager.disconnect();
      };
    }
  }, [user]);

  const setupAIEventListeners = useCallback(() => {
    // Agent started processing
    socketManager.socket.on("agent-started", (data) => {
      const { ticketId, agentType } = data;
      setAIProcessingTickets((prev) => {
        const newMap = new Map(prev);
        const ticket = newMap.get(ticketId) || {
          ticketId,
          agents: {},
          overallStatus: "processing",
        };

        ticket.agents[agentType] = {
          status: "processing",
          startedAt: new Date(),
          completedAt: null,
          result: null,
          error: null,
        };

        newMap.set(ticketId, ticket);
        return newMap;
      });
    });

    // Agent completed processing
    socketManager.socket.on("agent-completed", (data) => {
      const { ticketId, agentType, result, status } = data;
      setAIProcessingTickets((prev) => {
        const newMap = new Map(prev);
        const ticket = newMap.get(ticketId);

        if (ticket && ticket.agents[agentType]) {
          ticket.agents[agentType] = {
            ...ticket.agents[agentType],
            status: "completed",
            completedAt: new Date(),
            result: result,
          };

          // Check if all agents are completed
          const allCompleted = Object.values(ticket.agents).every(
            (agent) => agent.status === "completed",
          );

          if (allCompleted) {
            ticket.overallStatus = "completed";
          }

          newMap.set(ticketId, ticket);
        }

        return newMap;
      });
    });

    // Reply streaming
    socketManager.socket.on("reply-streaming", (data) => {
      const { ticketId, chunk } = data;
      setStreamingReplies((prev) => {
        const newMap = new Map(prev);
        const currentReply = newMap.get(ticketId) || "";
        newMap.set(ticketId, currentReply + chunk);
        return newMap;
      });
    });

    // Processing complete
    socketManager.socket.on("processing-complete", (data) => {
      const {
        ticketId,
        summary,
        category,
        sentiment,
        suggestedReply,
        citations,
      } = data;

      // Clear streaming reply
      setStreamingReplies((prev) => {
        const newMap = new Map(prev);
        newMap.delete(ticketId);
        return newMap;
      });

      // Update processing status
      setAIProcessingTickets((prev) => {
        const newMap = new Map(prev);
        const ticket = newMap.get(ticketId);

        if (ticket) {
          ticket.overallStatus = "completed";
          ticket.finalResults = {
            summary,
            category,
            sentiment,
            suggestedReply,
            citations,
          };
          newMap.set(ticketId, ticket);
        }

        return newMap;
      });
    });

    // Processing error
    socketManager.socket.on("processing-error", (data) => {
      const { ticketId, error } = data;
      setAIProcessingTickets((prev) => {
        const newMap = new Map(prev);
        const ticket = newMap.get(ticketId);

        if (ticket) {
          ticket.overallStatus = "failed";
          ticket.error = error;
          newMap.set(ticketId, ticket);
        }

        return newMap;
      });
    });

    // Agent progress updates
    socketManager.socket.on("agent-progress", (data) => {
      const { ticketId, agentType, status, step, total, message } = data;
      setAIProcessingTickets((prev) => {
        const newMap = new Map(prev);
        const ticket = newMap.get(ticketId) || {
          ticketId,
          agents: {},
          overallStatus: "processing",
          progress: { step, total, message },
        };

        if (agentType === "pipeline") {
          ticket.progress = { step, total, message };
        }

        newMap.set(ticketId, ticket);
        return newMap;
      });
    });

    // AI processing started
    socketManager.socket.on("ai-processing-started", (data) => {
      const { ticketId } = data;
      setAIProcessingTickets((prev) => {
        const newMap = new Map(prev);
        const ticket = newMap.get(ticketId) || {
          ticketId,
          agents: {},
          overallStatus: "processing",
        };

        ticket.overallStatus = "processing";
        newMap.set(ticketId, ticket);
        return newMap;
      });
    });
  }, []);

  const getTicketAIStatus = useCallback(
    (ticketId) => {
      return aiProcessingTickets.get(ticketId) || null;
    },
    [aiProcessingTickets],
  );

  const getStreamingReply = useCallback(
    (ticketId) => {
      return streamingReplies.get(ticketId) || "";
    },
    [streamingReplies],
  );

  const clearStreamingReply = useCallback((ticketId) => {
    setStreamingReplies((prev) => {
      const newMap = new Map(prev);
      newMap.delete(ticketId);
      return newMap;
    });
  }, []);

  // Function to join a specific ticket room
  const joinTicketRoom = useCallback(
    async (ticketId) => {
      if (socketConnected) {
        try {
          const result = await socketManager.joinTicketRoom(ticketId);
          console.log(`Joined ticket room: ${ticketId}`, result);
          return result;
        } catch (error) {
          console.error(`Failed to join ticket room: ${ticketId}`, error);
          throw error;
        }
      } else {
        throw new Error("Socket not connected");
      }
    },
    [socketConnected],
  );

  // Function to leave a specific ticket room
  const leaveTicketRoom = useCallback(async (ticketId) => {
    try {
      const result = await socketManager.leaveTicketRoom(ticketId);
      console.log(`Left ticket room: ${ticketId}`, result);
      return result;
    } catch (error) {
      console.error(`Failed to leave ticket room: ${ticketId}`, error);
      throw error;
    }
  }, []);

  const value = {
    // State
    socketConnected,
    aiProcessingTickets,
    streamingReplies,

    // Actions
    getTicketAIStatus,
    getStreamingReply,
    clearStreamingReply,
    joinTicketRoom,
    leaveTicketRoom,

    // Computed
    hasActiveProcessing: aiProcessingTickets.size > 0,
    isProcessing: (ticketId) => {
      const status = aiProcessingTickets.get(ticketId);
      return status?.overallStatus === "processing";
    },
  };

  return (
    <AIProcessingContext.Provider value={value}>
      {children}
    </AIProcessingContext.Provider>
  );
};
