import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export async function createTransaction(req: Request, res: Response) {
  try {
    const { eventId, pointsUsed, finalPrice, voucherId } = req.body;

    // Fetch the event
    const event = await prisma.events.findUnique({
      where: { event_id: eventId },
    });

    if (!event || event.spot === null || event.spot <= 0) {
      return res.status(400).json({ error: "No available slots for this event." });
    }

    // Fetch the user
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized user" });
    }

    // Validate voucher
    let discount = 0;
if (voucherId) {
  const voucher = await prisma.vouchers.findUnique({
    where: { id: voucherId },
  });

  if (!voucher || !voucher.status || voucher.end_date < new Date()) {
    return res.status(400).json({ error: "Invalid or expired voucher." });
  }

  // Ensure event_price is not null and convert Decimal to number
  const eventPrice = event.event_price ? Number(event.event_price) : 0;

  // Calculate discount (handle both percentage and fixed value)
  discount = voucher.type === "percentage"
    ? (eventPrice * voucher.amount) / 100
    : voucher.amount;

  // Deactivate the voucher
    await prisma.vouchers.update({
        where: { id: voucherId },
        data: { status: false },
    });
    }

    // Calculate the final price after applying the voucher and points
    const adjustedPrice = Math.max(Number(event.event_price || 0) - pointsUsed - discount, 0);

    // Validate points
    const userPoints = new Decimal(user.total_point);
    if (pointsUsed > 0 && userPoints.lessThan(pointsUsed)) {
    return res.status(400).json({ error: "Insufficient points." });
    }


    // Start transaction
    const transaction = await prisma.$transaction(async (tx) => {
      // Deduct points if used
      if (pointsUsed > 0) {
        const remainingPoints = userPoints.minus(pointsUsed);
        await tx.user.update({
          where: { id: req.user?.id },
          data: { total_point: remainingPoints },
        });
      }

      // Create the transaction
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
          status: "pending",
        },
      });

      // Decrement the event spot
      await tx.events.update({
        where: { event_id: eventId },
        data: {
          spot: event.spot !== null && event.spot !== undefined ? event.spot - 1 : 0,
        },
      });

      return newTransaction;
    });

    return res.status(201).json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function submitPayment(req: Request, res: Response) {
  try {
    const { eventId, finalPrice, pointsUsed } = req.body;

    // Ensure user is authenticated
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized: User information is missing." });
    }

    // Handle uploaded file (if required)
    const file = req.file; // Assuming you're using multer or similar middleware
    if (!file) {
      return res.status(400).json({ error: "Payment proof is required." });
    }

    // Validate required fields
    if (!eventId || !finalPrice) {
      return res.status(400).json({ error: "Missing required fields: eventId or finalPrice." });
    }

    // Generate a unique transaction code
    const transactionCode = uuidv4(); // Generate a UUID for the transaction code

    // Update the user's points and create the transaction
    const transaction = await prisma.transactions.create({
      data: {
        user_id: req.user.id as number, // Ensure req.user.id is a number
        event_id: parseInt(eventId, 10), // Convert eventId to number
        qty: 1, // Default to 1 ticket
        tax: 0, // Default to 0; update if you have tax logic
        point_used: pointsUsed ? parseFloat(pointsUsed) : 0, // Parse pointsUsed
        total_amount: parseFloat(finalPrice), // Parse finalPrice
        code: transactionCode, // Use the generated transaction code
        payment_method_id: 1, // Default payment method; replace with dynamic logic if needed
        status: "pending", // Default status for pending approval
      },
    });

    res.status(200).json({
      message: "Payment submitted successfully.",
      transaction,
    });
  } catch (error) {
    console.error("Error submitting payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
