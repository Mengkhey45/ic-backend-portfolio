import { Server } from "socket.io";
import prisma from "./prisma/client.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Adjust in production
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_chat", async (sessionId) => {
      socket.join(sessionId);
      
      // Fetch previous messages for this session
      const messages = await prisma.message.findMany({
        where: { sessionId },
        orderBy: { createdAt: "asc" }
      });
      
      socket.emit("previous_messages", messages);
    });

    socket.on("send_message", async (data) => {
      const { sessionId, sender, content } = data;
      
      // Ensure session exists
      let session = await prisma.chatSession.findUnique({
        where: { id: sessionId }
      });
      
      if (!session) {
        session = await prisma.chatSession.create({
          data: { id: sessionId, guestId: sessionId } // Using sessionId as guestId for simplicity
        });
      }

      // Save message
      const newMessage = await prisma.message.create({
        data: {
          sessionId,
          sender, // "guest" or "admin"
          content
        }
      });

      // Broadcast to session room
      io.to(sessionId).emit("receive_message", newMessage);
      
      // Optionally notify admin if the sender is a guest
      if (sender === "guest") {
        io.emit("new_chat_notification", { sessionId, message: content });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
};
