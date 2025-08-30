import apiClient from "./client.js";

export const authAPI = {
  async register(userData) {
    const response = await apiClient.post("/auth/register", userData);

    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
      const user = JSON.parse(atob(response.data.token.split(".")[1]));
      localStorage.setItem("user", JSON.stringify(user));
    }

    return response.data;
  },

  async login(credentials) {
    const response = await apiClient.post("/auth/login", credentials);

    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
      const user = JSON.parse(atob(response.data.token.split(".")[1]));
      localStorage.setItem("user", JSON.stringify(user));
    }

    return response.data;
  },

  async getCurrentUser() {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  isAuthenticated() {
    return !!localStorage.getItem("authToken");
  },

  getStoredUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
};
