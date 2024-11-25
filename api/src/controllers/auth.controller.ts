import { Request, Response, NextFunction } from "express";
import { transporter } from "../lib/mail";
import { PrismaClient } from "@prisma/client";
import { genSalt, hash, compare } from "bcrypt";
import { sign } from "jsonwebtoken";

import { SECRET_KEY, BASE_WEB_URL } from "../utils/envConfig";
import { User } from "../custom";
import path from "path";
import handlebars from "handlebars";
import fs from "fs";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function registerUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { fullname, email, password, phone_number, referral_code } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    // Check if the email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered!" });
    }

    // Validate referral code if provided
    let referrer = null;
    if (referral_code) {
      referrer = await prisma.user.findUnique({
        where: { referral_code },
      });

      if (!referrer) {
        return res.status(400).json({ error: "Invalid referral code!" });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique referral code
    const generateReferralCode = async (): Promise<string> => {
      const generateCode = () =>
        Array(10)
          .fill(null)
          .map(() => Math.random().toString(36)[2]) // Generate alphanumeric character
          .join("")
          .toUpperCase();

      let referralCode = generateCode();

      // Ensure the referral code is unique in the database
      while (
        await prisma.user.findUnique({
          where: { referral_code: referralCode },
        })
      ) {
        referralCode = generateCode(); // Generate a new code if it's not unique
      }

      return referralCode;
    };

    const referralCode = await generateReferralCode();

    // Create a new user with the referral code
    const newUser = await prisma.user.create({
      data: {
        fullname,
        email,
        phone_number,
        password: hashedPassword,
        referral_code: referralCode, // Add the referral code here
        total_point: 0,
        role_id: 1, // Default role_id
      },
    });

    // If a valid referral code was used, update the referrer's points or handle rewards
    if (referrer) {
      await prisma.user.update({
        where: { id: referrer.id },
        data: {
          total_point: {
            increment: 10000, // Add 10000 to existing member referral
          },
        },
      });
    }

    // Respond with the new user details
    const { id, createdAt } = newUser;
    return res.status(201).json({
      message: "User registered successfully!",
      user: {
        id,
        fullname,
        email,
        phone_number,
        referral_code: referralCode, // Return the referral code in the response
        createdAt,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    next(error);
  }
}



async function loginUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user in the database
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = sign(
      {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role_id,
      },
      SECRET_KEY as string,
      { expiresIn: "1h" }
    );

    // Respond with token and user info
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role_id,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
  
    return res.status(500).json({
      error: "Internal server error",
      details: (err as Error).message, // Type assertion
    });
  }
  
}



export { registerUser, loginUser };