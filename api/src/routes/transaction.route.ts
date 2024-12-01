import { Router } from "express";
import { createTransaction, submitPayment } from "../controllers/transaction.controller";
import { VerifyToken } from "../middlewares/auth.middleware";

const router = Router();

// POST: Create a transaction for ticket purchase
router.post("/create", VerifyToken as any, createTransaction as any);
router.post("/submit-payment", VerifyToken as any, submitPayment as any);

export default router;
