import apiClient from "./client.js";

export const aiActionsAPI = {
  async getTicketAIActions(ticketId) {
    const response = await apiClient.get(`/ai-actions/${ticketId}`);
    return response.data;
  },
};
