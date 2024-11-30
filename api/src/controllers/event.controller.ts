import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify"; // Optional: Use for generating slugs automatically if missing

const prisma = new PrismaClient();

export async function createEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        event_name,
        description,
        start_date,
        end_date,
        location,
        ticketPrice,
        event_slug,
        spot, // Add spot field
      } = req.body;
  
      console.log("Payload received in backend:", {
        event_name,
        description,
        start_date,
        end_date,
        location,
        ticketPrice,
        event_slug,
        spot,
      });
  
      // Validate required fields
      if (!event_name || !description || !start_date || !end_date || !location || !ticketPrice || !spot) {
        return res.status(400).json({ error: "All fields except slug are required!" });
      }
  
      // Check if the user is an Event Organizer
      if (req.user?.role !== "event-organizer") {
        return res.status(403).json({ error: "Only Event Organizers can create events!" });
      }
  
      // Validate spot to ensure it's a positive integer
      if (!Number.isInteger(spot) || spot <= 0) {
        return res.status(400).json({ error: "Spot must be a positive integer!" });
      }
  
      // Generate a slug if not provided
      const slug = event_slug || slugify(event_name, { lower: true });
  
      // Create a new event
      const event = await prisma.events.create({
        data: {
          event_name,
          event_description: description,
          start_date: new Date(start_date),
          end_date: new Date(end_date),
          location,
          event_price: parseFloat(ticketPrice),
          event_slug: slug,
          spot, // Add spot to the database entry
          created_by: req.user?.id,
        },
      });
  
      // Respond with success
      return res.status(201).json({
        message: "Event created successfully!",
        event,
      });
    } catch (error) {
      console.error("Error creating event:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  
  
  export async function findAllEvents(req: Request, res: Response) {
    try {
      const userId = req.user?.id; // Assuming the middleware sets `req.user` for the logged-in user.
  
      // Fetch all events
      const events = await prisma.events.findMany({
        select: {
          event_id: true,
          event_name: true,
          event_description: true,
          start_date: true,
          end_date: true,
          location: true,
          event_price: true,
          event_slug: true,
          created_by: true, // Include creator ID to check ownership
        },
      });
  
      // Add an `isOwner` field to indicate if the logged-in user is the creator
      const eventsWithOwnership = events.map((event) => ({
        ...event,
        isOwner: userId ? event.created_by === userId : false,
      }));
  
      return res.status(200).json({ events: eventsWithOwnership });
    } catch (error) {
      console.error("Error fetching events:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  
  export async function deleteEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const userId = req.user?.id;
  
      // Check if the event exists and is owned by the user
      const event = await prisma.events.findUnique({
        where: { event_id: Number(eventId) },
      });
  
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
  
      if (event.created_by !== userId) {
        return res.status(403).json({ error: "Unauthorized to delete this event" });
      }
  
      // Delete the event
      await prisma.events.delete({ where: { event_id: Number(eventId) } });
  
      return res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  