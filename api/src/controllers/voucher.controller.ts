import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUserVouchers = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (!userId) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    const vouchers = await prisma.vouchers.findMany({
      where: {
        user_id: userId,
        status: true, // Only active vouchers
        start_date: { lte: new Date() },
        end_date: { gte: new Date() },
      },
    });

    return res.status(200).json({ vouchers });
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
