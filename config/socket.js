import { Server } from "socket.io";
import Chat from "../models/chatSchema.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://sisters-backend.fly.dev"
      ],
      credentials: true,
    },
  });

  // store connected users { userId: socketId }
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // When a user joins (after login)
    socket.on("join", (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.join(userId);
      console.log(`User ${userId} joined their private room`);

      // Notify all users that someone is online
      io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
    });

    // When user disconnects
    socket.on("disconnect", () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      // Notify everyone again
      io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
      console.log("User disconnected:", socket.id);
    });

    // When a message is sent
    socket.on("sendMessage", async (data) => {
      const { senderId, receiverId, message } = data;
      const newMessage = new Chat({ senderId, receiverId, message });
      await newMessage.save();

      // io.to(senderId).emit("receiveMessage", newMessage);
      io.to(receiverId).emit("receiveMessage", newMessage);
    });
  });
};
