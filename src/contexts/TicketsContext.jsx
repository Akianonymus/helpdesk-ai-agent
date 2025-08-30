import { createContext, useContext, useState, useEffect } from "react";
import { ticketsAPI } from "../api/tickets.js";
import { useAuth } from "./AuthContext.jsx";

const TicketsContext = createContext();

export const useTickets = () => {
  const context = useContext(TicketsContext);
  if (!context) {
    throw new Error("useTickets must be used within a TicketsProvider");
  }
  return context;
};

export const TicketsProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const { user } = useAuth();

  // Load tickets on component mount and when filters change
  useEffect(() => {
    loadTickets();
  }, [filters]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (filters.status || filters.page > 1 || filters.limit !== 10) {
        // Use filtered API if filters are applied
        response = await ticketsAPI.filterTicketsByAIStatus({
          status: filters.status,
          page: filters.page,
          limit: filters.limit,
        });

        // Update pagination from response
        if (response.pagination) {
          setPagination({
            currentPage: response.pagination.page || 1,
            totalPages: response.pagination.totalPages || 1,
            totalItems: response.pagination.totalItems || 0,
            itemsPerPage: response.pagination.limit || 10,
          });
        }
      } else {
        // Use basic get tickets API
        response = await ticketsAPI.getTickets();
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: response.length || 0,
          itemsPerPage: 10,
        });
      }

      setTickets(response.tickets || response || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tickets");
      console.error("Error loading tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticketData) => {
    try {
      setLoading(true);
      setError(null);

      const newTicket = await ticketsAPI.createTicket(ticketData);
      setTickets((prev) => [newTicket, ...prev]);

      return newTicket;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTicket = async (ticketId) => {
    try {
      setLoading(true);
      setError(null);

      const ticket = await ticketsAPI.getTicket(ticketId);
      setCurrentTicket(ticket);

      return ticket;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load ticket");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (ticketId, updateData) => {
    try {
      setLoading(true);
      setError(null);

      const updatedTicket = await ticketsAPI.updateTicket(ticketId, updateData);

      // Update in tickets list
      setTickets((prev) =>
        prev.map((ticket) => (ticket._id === ticketId ? updatedTicket : ticket))
      );

      // Update current ticket if it's the one being viewed
      if (currentTicket && currentTicket._id === ticketId) {
        setCurrentTicket(updatedTicket);
      }

      return updatedTicket;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update ticket");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const retryAIProcessing = async (ticketId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await ticketsAPI.retryAIProcessing(ticketId);

      // Reload the specific ticket to get updated status
      await getTicket(ticketId);

      return response;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to retry AI processing");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      search: "",
      page: 1,
      limit: 10,
    });
  };

  const goToPage = (page) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    tickets,
    currentTicket,
    loading,
    error,
    filters,
    pagination,

    // Actions
    setCurrentTicket,
    createTicket,
    getTicket,
    updateTicket,
    retryAIProcessing,
    loadTickets,
    updateFilters,
    clearFilters,
    goToPage,
    clearError,

    // Computed
    hasTickets: tickets.length > 0,
    isAdmin: user?.role === "admin",
  };

  return (
    <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>
  );
};
