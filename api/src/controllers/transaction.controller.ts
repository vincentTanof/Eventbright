import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

// Create a new transaction
export async function createTransaction(req: Request, res: Response) {
  try {
    const { eventId, pointsUsed, finalPrice, voucherId } = req.body;

    // Fetch the event details
    const event = await prisma.events.findUnique({
      where: { event_id: eventId },
    });

    if (!event || event.spot === null || event.spot <= 0) {
      return res.status(400).json({ error: "No available slots for this event." });
    }

    // Fetch the user details
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized user." });
    }

    // Validate voucher (if provided)
    let discount = 0;
    if (voucherId) {
      const voucher = await prisma.vouchers.findUnique({
        where: { id: voucherId },
      });

      if (!voucher || !voucher.status || voucher.end_date < new Date()) {
        return res.status(400).json({ error: "Invalid or expired voucher." });
      }

      // Calculate discount based on voucher type
      const eventPrice = event.event_price ? Number(event.event_price) : 0;
      discount =
        voucher.type === "percentage"
          ? (eventPrice * voucher.amount) / 100
          : voucher.amount;

      // Deactivate the voucher
      await prisma.vouchers.update({
        where: { id: voucherId },
        data: { status: false },
      });
    }

    // Calculate the final price
    const adjustedPrice = Math.max(
      Number(event.event_price || 0) - pointsUsed - discount,
      0
    );

    // Validate points usage
    const userPoints = new Decimal(user.total_point);
    if (pointsUsed > 0 && userPoints.lessThan(pointsUsed)) {
      return res.status(400).json({ error: "Insufficient points." });
    }

    // Create a transaction within a database transaction
    const transaction = await prisma.$transaction(async (tx) => {
      // Deduct points from the user (if used)
      if (pointsUsed > 0) {
        const remainingPoints = userPoints.minus(pointsUsed);
        await tx.user.update({
          where: { id: req.user?.id },
          data: { total_point: remainingPoints },
        });
      }

      // Create the transaction record
      const newTransaction = await tx.transactions.create({
        data: {
          code: uuidv4(),
          user_id: req.user?.id as number,
          event_id: eventId,
          qty: 1,
          tax: 0,
          point_used: pointsUsed,
          total_amount: adjustedPrice,
          voucher_id: voucherId || null,
          payment_method_id: 1,
          status: "completed", // Mark as completed on creation
        },
      });

      // Update event's tickets_sold and spot
      await tx.events.update({
        where: { event_id: eventId },
        data: {
          tickets_sold: { increment: 1 }, // Increment tickets_sold
          spot: {
            decrement: 1, // Decrement the available spot
          },
        },
      });

      return newTransaction;
    });

    return res.status(201).json({
      message: "Transaction created successfully.",
      transaction,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}

// Submit payment for an event
export async function submitPayment(req: Request, res: Response) {
  try {
    const { eventId, finalPrice, pointsUsed } = req.body;

    // Ensure user authentication
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized: User information is missing." });
    }

    // Handle uploaded file (if applicable)
    const file = req.file; // Assuming you're using multer or similar middleware
    if (!file) {
      return res.status(400).json({ error: "Payment proof is required." });
    }

    // Validate required fields
    if (!eventId || !finalPrice) {
      return res.status(400).json({ error: "Missing required fields: eventId or finalPrice." });
    }

    // Generate a unique transaction code
    const transactionCode = uuidv4();

    // Create the transaction
    const transaction = await prisma.transactions.create({
      data: {
        user_id: req.user.id as number,
        event_id: parseInt(eventId, 10),
        qty: 1,
        tax: 0,
        point_used: pointsUsed ? parseFloat(pointsUsed) : 0,
        total_amount: parseFloat(finalPrice),
        code: transactionCode,
        payment_method_id: 1,
        status: "pending", // Default status for manual approval
      },
    });

    return res.status(200).json({
      message: "Payment submitted successfully.",
      transaction,
    });
  } catch (error) {
    console.error("Error submitting payment:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
