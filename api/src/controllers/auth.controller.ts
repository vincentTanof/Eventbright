import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

import { transporter } from "../lib/mail";

import { genSalt, hash, compare } from "bcrypt";
import { sign } from "jsonwebtoken";

import { SECRET_KEY, BASE_WEB_URL } from "../utils/envConfig";
import { User } from "../custom";
import path from "path";
import handlebars from "handlebars";
import fs from "fs";

const prisma = new PrismaClient();

async function registerUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { fullname, email, password, phone_number } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        fullname,
        email,
        phone_number,
        password: hashedPassword,
        total_point: 0,
        role_id: 1, // Explicitly assign the default role_id (e.g., 'User')
      },
    });
    

    const { id, createdAt } = newUser;
    return res.status(201).json({
      message: "User registered successfully!",
      user: {
        id,
        fullname,
        email,
        phone_number,
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
    return res.status(500).json({ error: "Internal server error", details: err});
  }
}



export { registerUser, loginUser};
