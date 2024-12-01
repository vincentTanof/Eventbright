import { Router } from "express";
import { getUserVouchers } from "../controllers/voucher.controller";

const router = Router();

router.get("/user/:id", getUserVouchers as any);

export default router;
