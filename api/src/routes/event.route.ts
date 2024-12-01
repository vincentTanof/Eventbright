import { Router } from "express";
import { VerifyToken, RoleGuard } from "../middlewares/auth.middleware";
import {
  createEvent,
  findAllEvents,
  findEventById,
  deleteEvent,
  updateEvent,
  getOrganizerEvents, // Import the new controller for fetching organizer's events
  findEventAttendees,
  findEventTransactions,
} from "../controllers/event.controller";

const router = Router();

// Event creation route, protected for "event-organizer" role
router.post("/create", VerifyToken as any, RoleGuard(["event-organizer"]) as any, createEvent as any);

// Route to fetch all events
router.get("/list", VerifyToken as any, findAllEvents as any);

// Route to fetch a single event by its ID
router.get("/:eventId", VerifyToken as any, findEventById as any);

// Route to delete an event
router.delete("/:eventId", VerifyToken as any, deleteEvent as any);

// Route to update an event
router.put("/:eventId", VerifyToken as any, RoleGuard(["event-organizer"]) as any, updateEvent as any);

// Route to fetch events created by an organizer
router.get(
  "/organizer/events",
  VerifyToken as any,
  RoleGuard(["event-organizer"]) as any,
  getOrganizerEvents as any
);

// New Routes
router.get("/:eventId/attendees", VerifyToken as any, RoleGuard(["event-organizer"]) as any, findEventAttendees as any);
  
router.get("/:eventId/transactions", VerifyToken as any, RoleGuard(["event-organizer"]) as any, findEventTransactions as any);
  
export default router;
