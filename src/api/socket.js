import { io } from "socket.io-client";

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
    this.joinedRooms = new Set();
    this.baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  }

  connect(token = null) {
    if (this.socket && this.isConnected) {
      return;
    }

    const authToken = token || localStorage.getItem("authToken");

    this.socket = io(this.baseURL, {
      auth: {
        token: authToken,
      },
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log("Socket.IO connected");
    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
      console.log("Socket.IO disconnected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
      this.isConnected = false;
    });

    this.setupDefaultEventHandlers();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.joinedRooms.clear();
    }
  }

  getSocket() {
    return this.socket;
  }

  joinTicketRoom(ticketId) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error("Socket not connected"));
        return;
      }

      const roomName = `ticket-${ticketId}`;

      if (this.joinedRooms.has(roomName)) {
        resolve({ ticketId, roomName, alreadyJoined: true });
        return;
      }

      const handleRoomJoined = (data) => {
        if (data.ticketId === ticketId) {
          this.joinedRooms.add(roomName);
          this.socket.off("ticket-room-joined", handleRoomJoined);
          resolve({ ticketId, roomName, alreadyJoined: false });
        }
      };

      this.socket.on("ticket-room-joined", handleRoomJoined);

      this.socket.emit("join-ticket", ticketId);

      setTimeout(() => {
        this.socket.off("ticket-room-joined", handleRoomJoined);
        reject(new Error("Timeout joining ticket room"));
      }, 5000);
    });
  }

  leaveTicketRoom(ticketId) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error("Socket not connected"));
        return;
      }

      const roomName = `ticket-${ticketId}`;

      if (!this.joinedRooms.has(roomName)) {
        resolve({ ticketId, roomName, alreadyLeft: true });
        return;
      }

      const handleRoomLeft = (data) => {
        if (data.ticketId === ticketId) {
          this.joinedRooms.delete(roomName);
          this.socket.off("ticket-room-left", handleRoomLeft);
          resolve({ ticketId, roomName, alreadyLeft: false });
        }
      };

      this.socket.on("ticket-room-left", handleRoomLeft);

      this.socket.emit("leave-ticket", ticketId);

      setTimeout(() => {
        this.socket.off("ticket-room-left", handleRoomLeft);
        reject(new Error("Timeout leaving ticket room"));
      }, 5000);
    });
  }

  isInTicketRoom(ticketId) {
    const roomName = `ticket-${ticketId}`;
    return this.joinedRooms.has(roomName);
  }

  getJoinedRooms() {
    return Array.from(this.joinedRooms);
  }

  setupDefaultEventHandlers() {
    if (!this.socket) return;

    this.socket.on("agent-started", (data) => {
      this.emitEvent("agent-started", data);
    });

    this.socket.on("agent-completed", (data) => {
      this.emitEvent("agent-completed", data);
    });

    this.socket.on("agent-progress", (data) => {
      this.emitEvent("agent-progress", data);
    });

    this.socket.on("reply-streaming", (data) => {
      this.emitEvent("reply-streaming", data);
    });

    this.socket.on("processing-complete", (data) => {
      this.emitEvent("processing-complete", data);
    });

    this.socket.on("processing-error", (data) => {
      this.emitEvent("processing-error", data);
    });

    this.socket.on("ai-processing-started", (data) => {
      this.emitEvent("ai-processing-started", data);
    });

    this.socket.on("ticket-room-joined", (data) => {
      this.emitEvent("ticket-room-joined", data);
    });

    this.socket.on("ticket-room-left", (data) => {
      this.emitEvent("ticket-room-left", data);
    });
  }

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  removeAllListeners(event) {
    this.eventListeners.delete(event);
  }

  emitEvent(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }

  reconnect() {
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  cleanup() {
    this.eventListeners.clear();
    this.joinedRooms.clear();
    this.disconnect();
  }
}

const socketManager = new SocketManager();

export default socketManager;
