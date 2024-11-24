import { Request, Response, NextFunction } from "express";
import { SECRET_KEY } from "../utils/envConfig";
import { verify } from "jsonwebtoken";
import { User } from "../custom";

async function VerifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract token from Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Token is missing" });
    }

    // Verify the token and extract user
    const user = verify(token, SECRET_KEY as string);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    // Attach user to request
    req.user = user as User;

    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ error: "Unauthorized: Token verification failed" });
  }
}


async function AdminGuard(req: Request, res: Response, next: NextFunction) {
  try {
    // Check if user role is admin
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    next();
  } catch (err) {
    console.error("AdminGuard error:", err);
    return res.status(403).json({ error: "Forbidden: Access denied" });
  }
}


export { VerifyToken, AdminGuard };
