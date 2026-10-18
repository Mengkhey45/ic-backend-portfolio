import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { sanitizeNoSQL } from "./middlewares/mongo-sanitize.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import shareRoutes from "./routes/share.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

// Trust reverse proxy (Render, Vercel, Cloudflare) for accurate rate limiting by real client IP
app.set("trust proxy", 1);

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Strict CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://mengkhey45.github.io",
  "https://mengkhey.vercel.app",
  "https://ic-vert.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    
    const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, "") : null;
    const isAllowed = allowedOrigins.includes(origin) || (frontendUrl && origin === frontendUrl);
                     
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(compression({ threshold: 1024 }));
app.use(morgan("dev"));

// Body parsing with safe limits (DoS protection)
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Prevent MongoDB operator injection (e.g. { "$gt": "" })
app.use(sanitizeNoSQL);

// Rate limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter for login attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later." },
});

// Dedicated limiter to prevent brute-forcing 6-digit portfolio access codes
const portfolioLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // maximum 30 attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many portfolio access attempts, please try again later." },
});

app.use("/api", apiLimiter);

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/share-links", shareRoutes);
app.use("/api/portfolio", portfolioLimiter, portfolioRoutes);
app.use("/api/profile", profileRoutes);


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
