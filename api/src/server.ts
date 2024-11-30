import express, { Application } from "express";
import { PORT as port, BASE_WEB_URL } from "./utils/envConfig";
import cors from "cors";

import ErrorMiddleware from "./middlewares/error.middleware";
import authRouter from "./routes/auth.route";
import eventRouter from "./routes/event.route";
import adminRoutes from "./routes/admin.route";

const PORT = Number(port) || 8000;

const app: Application = express();

// Cors configuration to allow cross-origin requests
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Middleware for parsing JSON
app.use(express.json());

// Route registrations
app.use("/auth", authRouter);
app.use("/event", eventRouter);
app.use("/api/admin", adminRoutes); // Ensure this is added

// Error handling middleware
app.use(ErrorMiddleware);

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
