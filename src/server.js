import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 4000;

// Start the server first
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
  
  // Connect to MongoDB in the background
  connectDB().then(() => {
    console.log("Database connection sequence finished");
  }).catch(err => {
    console.error("Critical: Database connection failed during startup", err);
  });
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
  });
});
