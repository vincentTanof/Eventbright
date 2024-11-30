import { Request, Response, NextFunction } from "express";
import transporter from "../lib/mail";
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

    // Check for missing required fields
    if (!fullname || !email || !password) {
      return res.status(400).json({ error: "All fields except referral code are required!" });
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered!" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique referral code for the new user
    const generateReferralCode = (): string => {
      return [...Array(10)]
        .map(() => Math.random().toString(36)[2].toUpperCase())
        .join("");
    };

    let newReferralCode = generateReferralCode();
    while (
      await prisma.user.findUnique({ where: { referral_code: newReferralCode } })
    ) {
      newReferralCode = generateReferralCode();
    }

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        fullname,
        email,
        phone_number,
        password: hashedPassword,
        referral_code: newReferralCode,
        total_point: 0,
        role_id: 1, // Default role for general users
      },
    });

    // If a referral code is provided, validate and process it
    if (referral_code) {
      const referrer = await prisma.user.findUnique({
        where: { referral_code },
      });

      if (!referrer) {
        return res.status(400).json({ error: "Invalid referral code!" });
      }

      // Increment the referrer's points
      await prisma.user.update({
        where: { id: referrer.id },
        data: {
          total_point: {
            increment: 10000, // Add 10,000 points to the referrer
          },
        },
      });

      // Optional: Track referral history
      await prisma.referralHistory.create({
        data: {
          referrerId: referrer.id,
          referredUserId: newUser.id,
        },
      });
    }

    // Generate a verification token
    const verificationToken = sign(
      { email: newUser.email },
      SECRET_KEY as string,
      { expiresIn: "1h" }
    );

    // Send a welcome email with verification link
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: newUser.email,
      subject: "Welcome to Eventbright!",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h1>Welcome to Eventbright!</h1>
          <p>Hello ${newUser.fullname},</p>
          <p>Thank you for registering with us.</p>
          <p>To complete your registration, please click the link below:</p>
          <a href="${BASE_WEB_URL}/verify?token=${verificationToken}" style="display: inline-block; padding: 10px 15px; color: white; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>If you did not register, please ignore this email.</p>
          <p>Best Regards,<br/>The Eventbright Team</p>
        </div>
      `,
    });

    // Respond with user details
    return res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: newUser.id,
        fullname: newUser.fullname,
        email: newUser.email,
        referral_code: newUser.referral_code,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}






async function loginUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user in the database, include the role relation
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }, // Include the role relation to access role.name
    });

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
        role: user.role.name, // This should be a string like "event-organizer"
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
        name: user.fullname, // Rename fullname to name
        email: user.email,
        role: user.role.name, // Send role name instead of role_id
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