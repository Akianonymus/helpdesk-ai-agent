import { useState, useEffect } from "react";
import { useTickets } from "../../contexts/TicketsContext.jsx";
import { useAIProcessing } from "../../contexts/AIProcessingContext.jsx";
import { AI_PROCESSING_STATUS, TICKET_STATUS } from "../../types/ticket.js";
import AIResultsDisplay from "../ai/AIResultsDisplay.jsx";
import StreamingReply from "../ai/StreamingReply.jsx";

const TicketDetail = ({ ticket }) => {
  const { updateTicket, retryAIProcessing, loading } = useTickets();
  const {
    aiProcessingTickets,
    streamingReplies,
    socketConnected,
    joinTicketRoom,
    leaveTicketRoom,
  } = useAIProcessing();

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: ticket?.status || "",
    assignedTo: ticket?.assignedTo || "",
  });

  // Socket room management
  useEffect(() => {
    if (ticket?._id && socketConnected) {
      // Join ticket room for real-time updates
      joinTicketRoom(ticket._id).catch((error) => {
        console.error("Failed to join ticket room:", error);
      });

      // Cleanup: leave room when component unmounts
      return () => {
        if (socketConnected) {
          leaveTicketRoom(ticket._id).catch((error) => {
            console.error("Failed to leave ticket room:", error);
          });
        }
      };
    }
  }, [ticket?._id, socketConnected]);

  // Get AI processing data for this ticket
  const ticketAIProcessing = aiProcessingTickets.get(ticket?._id);

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading ticket details...</p>
      </div>
    );
  }

  const getAIStatusBadge = (status) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (status) {
      case AI_PROCESSING_STATUS.COMPLETED:
        return `${baseClasses} bg-green-100 text-green-800`;
      case AI_PROCESSING_STATUS.PROCESSING:
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case AI_PROCESSING_STATUS.FAILED:
        return `${baseClasses} bg-red-100 text-red-800`;
      case AI_PROCESSING_STATUS.RETRY:
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case AI_PROCESSING_STATUS.PENDING:
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (status) {
      case TICKET_STATUS.OPEN:
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case TICKET_STATUS.IN_PROGRESS:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case TICKET_STATUS.RESOLVED:
        return `${baseClasses} bg-green-100 text-green-800`;
      case TICKET_STATUS.CLOSED:
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusUpdate = async () => {
    if (!updateData.status || updateData.status === ticket.status) return;

    setIsUpdating(true);
    try {
      await updateTicket(ticket._id, { status: updateData.status });
    } catch (err) {
      console.error("Failed to update ticket status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRetryAI = async () => {
    try {
      await retryAIProcessing(ticket._id);
    } catch (err) {
      console.error("Failed to retry AI processing:", err);
    }
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
            <div className="flex items-center space-x-3 mt-2">
              <span className={getStatusBadge(ticket.status)}>
                {ticket.status}
              </span>
              <span className={getAIStatusBadge(ticket.aiProcessingStatus)}>
                AI: {ticket.aiProcessingStatus}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            {ticket.aiProcessingStatus === AI_PROCESSING_STATUS.FAILED && (
              <button
                onClick={handleRetryAI}
                disabled={loading}
                className="px-3 py-2 border border-orange-300 text-orange-700 rounded-md text-sm font-medium hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                Retry AI Processing
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Description
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>
            </div>

            {/* Real-time AI Processing Status */}
            {ticketAIProcessing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-900 mb-3">
                  AI Processing Status
                </h3>

                {/* Pipeline Progress Bar */}
                {ticketAIProcessing.progress && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">
                        Pipeline Progress
                      </span>
                      <span className="text-sm text-blue-600">
                        Step {ticketAIProcessing.progress.step} of{" "}
                        {ticketAIProcessing.progress.total}
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                        style={{
                          width: `${(ticketAIProcessing.progress.step / ticketAIProcessing.progress.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      {ticketAIProcessing.progress.message}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {Object.entries(ticketAIProcessing.agents || {}).map(
                    ([agentType, agent]) => (
                      <div
                        key={agentType}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium text-blue-800 capitalize">
                          {agentType.replace("Agent", "")}
                        </span>
                        <div className="flex items-center space-x-2">
                          {agent.status === "processing" && (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span className="text-sm text-blue-600">
                                Processing...
                              </span>
                            </div>
                          )}
                          {agent.status === "completed" && (
                            <div className="flex items-center space-x-2">
                              <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                                <svg
                                  className="h-3 w-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <span className="text-sm text-green-600">
                                Completed
                              </span>
                            </div>
                          )}
                          {agent.status === "failed" && (
                            <div className="flex items-center space-x-2">
                              <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                                <svg
                                  className="h-3 w-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <span className="text-sm text-red-600">
                                Failed
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                  {ticketAIProcessing.overallStatus && (
                    <div className="pt-3 border-t border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">
                          Overall Status
                        </span>
                        <span
                          className={`text-sm px-2 py-1 rounded-full ${
                            ticketAIProcessing.overallStatus === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {ticketAIProcessing.overallStatus}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Streaming Reply */}
            <StreamingReply ticketId={ticket._id} />

            {/* AI Results Display */}
            <AIResultsDisplay ticketId={ticket._id} ticket={ticket} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ticket Information
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Ticket ID
                  </dt>
                  <dd className="text-sm text-gray-900 font-mono">
                    {ticket._id}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900">
                    {formatDate(ticket.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Last Updated
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {formatDate(ticket.updatedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">User ID</dt>
                  <dd className="text-sm text-gray-900 font-mono">
                    {ticket.userId._id}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Status Update (Admin) */}
            {ticket.status !== TICKET_STATUS.CLOSED && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Update Status
                </h3>
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Status
                    </label>
                    <select
                      disabled={ticket.status === TICKET_STATUS.CLOSED}
                      id="status"
                      value={updateData.status}
                      onChange={(e) =>
                        setUpdateData((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Select status</option>
                      <option value={TICKET_STATUS.OPEN}>Open</option>
                      <option value={TICKET_STATUS.IN_PROGRESS}>
                        In Progress
                      </option>
                      <option value={TICKET_STATUS.RESOLVED}>Resolved</option>
                      <option value={TICKET_STATUS.CLOSED}>Closed</option>
                    </select>
                  </div>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={
                      !updateData.status ||
                      updateData.status === ticket.status ||
                      isUpdating
                    }
                    className="w-full px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? "Updating..." : "Update Status"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
