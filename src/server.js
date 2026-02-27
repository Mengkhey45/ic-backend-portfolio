import "dotenv/config";
import http from "http";
import app from "./app.js";
import { initSocket } from "./socket.js";
import prisma from "./prisma/client.js";

const server = http.createServer(app);
const io = initSocket(server);

// Make io instance available throughout the app if needed
app.set("io", io);

const PORT = process.env.PORT || 4000;

// Test DB connection on startup
const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log("Database connection successful ✅");
  } catch (err) {
    console.error("Database connection failed ❌");
    console.error(err);
  }
};

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  testConnection();
});
