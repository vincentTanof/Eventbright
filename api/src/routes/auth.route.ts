import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller";
import { VerifyToken, RoleGuard } from "../middlewares/auth.middleware";

const router = Router();

// Public routes
router.post("/register", registerUser as any);
router.post("/login", loginUser as any);

// Protected route example: Check user authentication
router.get("/protected", VerifyToken as any, (req, res) => {
  res.status(200).json({ message: "You have access to protected content!" });
});

// Role-specific protected route example: Admin-only access
router.get("/admin", VerifyToken as any, RoleGuard(["admin"]) as any,
  (req, res) => {
    res.status(200).json({ message: "Welcome, Admin!" });
  }
);

// Role-specific protected route example: Event Organizer
router.get("/organizer", VerifyToken as any, RoleGuard(["event organizer"]) as any,
  (req, res) => {
    res.status(200).json({ message: "Welcome, Event Organizer!" });
  }
);

export default router;
