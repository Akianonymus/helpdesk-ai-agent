import apiClient from "./client.js";

export const ticketsAPI = {
  async createTicket(ticketData) {
    const response = await apiClient.post("/tickets", ticketData);
    return response.data;
  },

  async getTickets() {
    const response = await apiClient.get("/tickets");
    return response.data;
  },

  async getTicket(ticketId) {
    const response = await apiClient.get(`/tickets/${ticketId}`);
    return response.data;
  },

  async updateTicket(ticketId, updateData) {
    const response = await apiClient.put(`/tickets/${ticketId}`, updateData);
    return response.data;
  },

  async retryAIProcessing(ticketId) {
    const response = await apiClient.post(`/tickets/${ticketId}/retry-ai`);
    return response.data;
  },

  async filterTicketsByAIStatus(filterOptions = {}) {
    const params = new URLSearchParams();

    if (filterOptions.status) params.append("status", filterOptions.status);
    if (filterOptions.limit) params.append("limit", filterOptions.limit);
    if (filterOptions.page) params.append("page", filterOptions.page);

    const response = await apiClient.get(
      `/tickets/filter/ai-status?${params.toString()}`,
    );
    return response.data;
  },
};
