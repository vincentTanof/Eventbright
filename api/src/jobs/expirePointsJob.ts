import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const expirePoints = async () => {
  try {
    const now = new Date();

    // Find all expired points
    const expiredPoints = await prisma.points.findMany({
      where: {
        expired_at: {
          lte: now, // Points whose expiration date is less than or equal to the current date
        },
      },
    });

    // Deduct expired points from the user's total_point
    for (const point of expiredPoints) {
      await prisma.user.update({
        where: { id: point.user_id },
        data: {
          total_point: {
            decrement: point.point, // Deduct expired points
          },
        },
      });
    }

    // Delete the expired points
    await prisma.points.deleteMany({
      where: {
        expired_at: {
          lte: now,
        },
      },
    });

    console.log("Expired points processed successfully.");
  } catch (error) {
    console.error("Error expiring points:", error);
  }
};

export default expirePoints;
