import { Router } from "express";
import {
  createOrganizerRequest,
  getAllOrganizerRequests,
  approveOrganizerRequest,
  declineOrganizerRequest,
} from "../controllers/admin.controller";

// POST: Create an organizer request
import { VerifyToken, RoleGuard } from "../middlewares/auth.middleware";

const router = Router();

router.post("/organizer/request",
  VerifyToken as any, // Add token verification middleware
  RoleGuard(["user"]) as any, // Allow only users to access this route
  createOrganizerRequest as any
);


// GET: Get all pending organizer requests
router.get("/organizer/requests", VerifyToken as any, RoleGuard(["admin"]) as any, getAllOrganizerRequests);

// PUT: Approve an organizer request
router.put("/organizer/request/approve", approveOrganizerRequest);

// PUT: Decline an organizer request
router.put("/organizer/request/decline", declineOrganizerRequest);

export default router;
