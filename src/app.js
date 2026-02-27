import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "https://mengkhey45.github.io", "https://mengkhey.vercel.app"], 
  credentials: true
}));
app.use(compression());
app.use(morgan("dev"));

// Custom logging for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/chat", chatRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Root route for Render and general use
app.get("/", (req, res) => {
  res.status(200).send("Backend Portfolio API is running 🚀");
});

// Error handling
app.use(errorMiddleware);

export default app;
