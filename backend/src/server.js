import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import soilAnalysisRoutes from "./routes/soilAnalysis.js";
import chatbotRoutes from "./routes/chatbot.js";
import weatherRoutes from "./routes/weather.js";
import cropRoutes from "./routes/crop.js";
import farmRoutes from "./routes/farm.js";
import expertRoutes from "./routes/expert.js";
import notificationRoutes from "./routes/notification.js";
import dashboardRoutes from "./routes/dashboard.js";

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

// Import database connection
import connectDB from "./config/database.js";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = createServer(app);

// Socket.IO setup for real-time features
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:3000",
    credentials: true,
  },
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});

// Middleware
app.use(helmet());
app.use(morgan("combined"));
app.use(limiter);
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files (uploaded images, documents)
app.use("/uploads", express.static("uploads"));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Bindisa Agritech API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/soil-analysis", soilAnalysisRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/experts", expertRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join user to their personal room for notifications
  socket.on("join_user_room", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined personal room`);
  });

  // Handle real-time chatbot messages
  socket.on("chatbot_message", (data) => {
    // Process chatbot message and emit response
    socket.emit("chatbot_response", {
      message: "Processing your query...",
      timestamp: new Date(),
    });
  });

  // Handle soil analysis updates
  socket.on("soil_analysis_update", (data) => {
    socket.emit("analysis_complete", {
      results: data,
      timestamp: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🌱 Bindisa Agritech API server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

export default app;
