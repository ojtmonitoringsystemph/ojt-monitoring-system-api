import dotenv from "dotenv";
import { createApp } from "./config/app";
import { connectDatabase } from "./config/database";
import { config } from "./config/constants";
import { Server as SocketIOServer } from "socket.io";
import http from "http";
import "reflect-metadata";

dotenv.config();

// Purpose: Start the server
const startServer = async () => {
  try {
    await connectDatabase();

    const server = http.createServer();
    const port = process.env.PORT || config.PORT;
    const io = new SocketIOServer(server, {
      cors: { origin: "*" },
    });

    // Create app with socket.io instance
    const app = createApp(io);

    // Add socket connection handling
    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // Join user to their own room for private messaging
      socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    // Attach the app to the server
    server.on("request", app);

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
