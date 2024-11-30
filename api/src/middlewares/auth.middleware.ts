import { Request, Response, NextFunction } from "express";
import { SECRET_KEY } from "../utils/envConfig";
import { verify } from "jsonwebtoken";
import { User } from "../custom";
import { PrismaClient } from "@prisma/client"; // Import PrismaClient


const prisma = new PrismaClient(); // Instantiate PrismaClient globally for this file

async function VerifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("Authorization Header:", req.header("Authorization")); // Debugging
    console.log("Extracted Token:", token); // Debugging

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Token is missing" });
    }

    const user = verify(token, SECRET_KEY as string);
    console.log("Decoded Token:", user); // Debugging

    req.user = user as User;
    next();
  } catch (err: any) {
    console.error("Token verification error:", err.message); // Debugging
    return res.status(401).json({ error: "Unauthorized: Token verification failed" });
  }
}




function RoleGuard(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("User Role from Request:", req.user?.role);
      console.log("Allowed Roles:", allowedRoles);

      const userRole = req.user?.role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        console.error("Access Denied: Insufficient role");
        return res.status(403).json({ error: "Forbidden: Access denied!" });
      }

      next();
    } catch (err) {
      console.error("Error in RoleGuard:", err);
      res.status(403).json({ error: "Forbidden: Access denied!" });
    }
  };
}






export { VerifyToken, RoleGuard };
