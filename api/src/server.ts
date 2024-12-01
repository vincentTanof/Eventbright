import express, { Application } from "express";
import { PORT as port } from "./utils/envConfig";
import cors from "cors";

import ErrorMiddleware from "./middlewares/error.middleware";
import authRouter from "./routes/auth.route";
import eventRouter from "./routes/event.route";
import adminRoutes from "./routes/admin.route";
import transactionRoutes from "./routes/transaction.route";
import voucherRoutes from "./routes/voucher.route";

import cron from "node-cron";
import expirePoints from "./jobs/expirePointsJob";

const PORT = Number(port) || 8000;

const app: Application = express();

// Cors configuration to allow cross-origin requests
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Schedule the job to run daily at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running scheduled task: Expire Points");
  await expirePoints();
});

// Middleware for parsing JSON
app.use(express.json());

// Route registrations
app.use("/auth", authRouter);
app.use("/event", eventRouter);
app.use("/api/admin", adminRoutes);
app.use("/transaction", transactionRoutes);
app.use("/voucher", voucherRoutes);

// Error handling middleware
app.use(ErrorMiddleware);

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
