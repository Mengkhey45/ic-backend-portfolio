import "dotenv/config";
import http from "http";
import app from "./app.js";
import { initSocket } from "./socket.js";

const server = http.createServer(app);
const io = initSocket(server);

// Make io instance available throughout the app if needed
app.set("io", io);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
