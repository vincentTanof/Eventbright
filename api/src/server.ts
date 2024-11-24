import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import configuration, middleware, and routes
import { PORT as port, BASE_WEB_URL } from "./utils/envConfig";
import ErrorMiddleware from "./middlewares/error.middleware";
import authRouter from "./routes/auth.route"; // Adjust the path if necessary

// Validate environment variables
if (!BASE_WEB_URL) {
  throw new Error("BASE_WEB_URL is not defined in the environment variables.");
}
if (!port) {
  throw new Error("PORT is not defined in the environment variables.");
}

// Set the port from environment variables or default to 8000
const PORT: number = Number(port) || 8000;

// Initialize the Express application
const app: Application = express();

// Enable CORS to allow access from specific origins
app.use(
  cors({
    origin: BASE_WEB_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Enable JSON request body parsing
app.use(express.json());

// Add a health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date() });
});

// Mount authentication routes
app.use("/auth", authRouter);

// Error handling middleware
app.use(ErrorMiddleware);

// Start the server and log a success message
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
