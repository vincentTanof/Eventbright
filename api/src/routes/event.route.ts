import { Router } from "express";
import { VerifyToken, RoleGuard } from "../middlewares/auth.middleware";
import { createEvent, findAllEvents, deleteEvent } from "../controllers/event.controller";

const router = Router();

// Event creation route, protected for "event-organizer" role
router.post("/create", VerifyToken as any, RoleGuard(["event-organizer"]) as any, createEvent as any);

router.get("/find", VerifyToken as any, findAllEvents as any);

router.delete("/:eventId", VerifyToken as any, deleteEvent as any);


// Export the router
export default router;

