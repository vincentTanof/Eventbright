import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller";

console.log("loginUser:", loginUser); // This will log the function or 'undefined'
console.log("registerUser:", registerUser); // This will log the function or 'undefined'

const router = Router();

router.post("/register", registerUser as any); // Remove `as any`
router.post("/login", loginUser as any); // Remove `as any`

export default router;
