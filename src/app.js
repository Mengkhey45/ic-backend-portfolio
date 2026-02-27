import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import shareRoutes from "./routes/share.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Dynamic CORS configuration to support Vercel preview links and production
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://mengkhey45.github.io",
  "https://mengkhey.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                     origin.endsWith(".vercel.app") || 
                     origin.endsWith(".github.io");
                     
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(compression());
app.use(morgan("dev"));

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/share-links", shareRoutes);
app.use("/api/portfolio", portfolioRoutes);

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
