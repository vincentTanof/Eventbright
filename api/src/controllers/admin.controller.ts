import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createOrganizerRequest(req: Request, res: Response) {
    console.log("User from request:", req.user); // Debugging log
    const { name, reason } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        // Check if a request already exists for this user
        const existingRequest = await prisma.organizerRequests.findFirst({
            where: { user_id: userId, status: "pending" },
        });

        if (existingRequest) {
            return res.status(409).json({ error: "Request already submitted and pending approval" });
        }

        // Create a new request if none exists
        const request = await prisma.organizerRequests.create({
            data: {
                user_id: userId,
                name,
                reason,
            },
        });

        res.status(201).json({ message: "Request submitted successfully!", request });
    } catch (error) {
        console.error("Error creating organizer request:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}



export async function getAllOrganizerRequests(req: Request, res: Response) {
    try {
      const requests = await prisma.organizerRequests.findMany({
        where: { status: "pending" },
      });
  
      res.status(200).json({ requests });
    } catch (error) {
      console.error("Error fetching requests:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  
  export async function approveOrganizerRequest(req: Request, res: Response) {
    const { requestId } = req.body;
  
    try {
      const request = await prisma.organizerRequests.update({
        where: { id: requestId },
        data: { status: "approved" },
      });
  
      // Update user role
      await prisma.user.update({
        where: { id: request.user_id },
        data: { role_id: 2, is_approved: true }, // Role 2 = Event Organizer
      });
  
      res.status(200).json({ message: "Request approved successfully" });
    } catch (error) {
      console.error("Error approving request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  
  export async function declineOrganizerRequest(req: Request, res: Response) {
    const { requestId } = req.body;
  
    try {
      await prisma.organizerRequests.update({
        where: { id: requestId },
        data: { status: "declined" },
      });
  
      res.status(200).json({ message: "Request declined successfully" });
    } catch (error) {
      console.error("Error declining request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  