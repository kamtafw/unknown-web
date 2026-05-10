import io, { Socket } from "socket.io-client";
import { useAuthStore } from "@/store/userStore";

let socket: Socket | null = null;

export const initializeSocket = () => {
  const { accessToken } = useAuthStore.getState();

  if (!accessToken) {
    console.error("No access token available");
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
    path: "/ws",
    auth: {
      token: accessToken,
    },
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socket.on("connect_error", (error: Error) => {
    // ADD TYPE HERE
    console.error("Socket connection error:", error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
