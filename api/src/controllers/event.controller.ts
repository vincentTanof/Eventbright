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
          spot: true, // Include available slots
          created_by: true,
        },
      });
  
      return res.status(200).json({ events });
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
  
  // Add this in your event.controller.ts

  export async function findEventById(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
  
      // Fetch the event details
      const event = await prisma.events.findUnique({
        where: { event_id: Number(eventId) },
      });
  
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
  
      return res.status(200).json({ event });
    } catch (error) {
      console.error("Error fetching event details:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  
  export const updateEvent = async (req: Request, res: Response) => {
    try {
      const organizerId = req.user?.id;
      const eventId = parseInt(req.params.eventId, 10);
  
      const { event_name, start_date, end_date, spot } = req.body;
  
      // Check if the event exists and is owned by the organizer
      const event = await prisma.events.findUnique({
        where: { event_id: eventId },
      });
  
      if (!event || event.created_by !== organizerId) {
        return res.status(403).json({ error: "Forbidden" });
      }
  
      // Construct the update data object dynamically, keeping existing values if not provided
      const updateData: any = {};
      if (event_name) updateData.event_name = event_name;
      if (start_date) updateData.start_date = new Date(start_date);
      if (end_date) updateData.end_date = new Date(end_date);
      if (spot) updateData.spot = spot;
  
      const updatedEvent = await prisma.events.update({
        where: { event_id: eventId },
        data: updateData,
      });
  
      return res.status(200).json({ event: updatedEvent });
    } catch (error) {
      console.error("Error updating event:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  
  
  export const getOrganizerEvents = async (req: Request, res: Response) => {
    try {
      const organizerId = req.user?.id;
  
      // Fetch events created by the logged-in organizer
      const events = await prisma.events.findMany({
        where: { created_by: organizerId },
      });
  
      res.status(200).json({ events });
    } catch (error) {
      console.error("Error fetching organizer events:", error);
      res.status(500).json({ error: "Failed to fetch organizer events" });
    }
  };

  export const findEventAttendees = async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId, 10);
  
      // Fetch transactions with user details
      const transactions = await prisma.transactions.findMany({
        where: { event_id: eventId },
        select: {
          id: true,
          total_amount: true,
          point_used: true,
          status: true,
          payment_method: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              fullname: true,
              email: true,
            },
          },
          voucher: { // Include the voucher details
            select: {
              voucher_code: true,
              status: true,
            },
          },
        },
      });
      
  
      console.log("Fetched Transactions:", transactions);
  
      // Check if the transactions have user data
      if (!transactions || transactions.length === 0) {
        return res.status(200).json({ attendees: [] });
      }
  
      // Extract attendee names
      const attendeeList = transactions
        .filter((transaction) => transaction.user) // Ensure user data exists
        .map((transaction) => transaction.user.fullname);
  
      console.log("Attendee List:", attendeeList);
  
      return res.status(200).json({ attendees: attendeeList });
    } catch (error) {
      console.error("Error fetching attendees:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  

  
  
  
  
  export const findEventTransactions = async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId, 10);
  
      const transactions = await prisma.transactions.findMany({
        where: { event_id: eventId },
        include: {
          user: true, // Include user details
          payment_method: true, // Include payment method
          voucher: true, // Optionally include voucher details
        },
      });
  
      return res.status(200).json({ transactions });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  
  export const getEventStatistics = async (req: Request, res: Response) => {
    try {
      const organizerId = req.user?.id;
  
      if (req.user?.role !== "event-organizer") {
        return res
          .status(403)
          .json({ error: "Only Event Organizers can view statistics!" });
      }
  
      console.log("Fetching statistics for organizer ID:", organizerId);
  
      const events = await prisma.events.findMany({
        where: {
          created_by: organizerId,
        },
        select: {
          event_name: true,
          start_date: true,
          tickets_sold: true,
          event_price: true,
        },
      });
  
      console.log("Fetched events:", events);
  
      const formattedStatistics = events.map((event) => {
        const year = new Date(event.start_date).getFullYear().toString();
        const month = new Date(event.start_date).toLocaleString("default", {
          month: "long",
        });
        const day = new Date(event.start_date).toISOString().split("T")[0];
        const total_earning =
          (event.tickets_sold ?? 0) * Number(event.event_price ?? 0);
  
        return {
          year,
          month,
          day,
          total_earning,
        };
      });
  
      return res.status(200).json({ statistics: formattedStatistics });
    } catch (error) {
      console.error("Error fetching event statistics:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  
  
  
  
  

  
  
  