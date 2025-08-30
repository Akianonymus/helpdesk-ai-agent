export { authAPI } from "./auth.js";
export { ticketsAPI } from "./tickets.js";
export { aiActionsAPI } from "./aiActions.js";
export { default as socketManager } from "./socket.js";

import apiClient from "./client.js";
export { default as apiClient } from "./client.js";

export const initializeAPI = (token = null) => {
  if (token) {
    socketManager.connect(token);
  }

  return {
    auth: authAPI,
    tickets: ticketsAPI,
    aiActions: aiActionsAPI,
    socket: socketManager,
    client: apiClient,
  };
};

export default {
  auth: authAPI,
  tickets: ticketsAPI,
  aiActions: aiActionsAPI,
  socket: socketManager,
  client: apiClient,
  initialize: initializeAPI,
};
