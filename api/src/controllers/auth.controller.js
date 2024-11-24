"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
function registerUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { fullname, email, password, phone_number } = req.body;
            if (!fullname || !email || !password) {
                return res.status(400).json({ error: "All fields are required!" });
            }
            const existingUser = yield prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                return res.status(400).json({ error: "Email is already registered!" });
            }
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const newUser = yield prisma.user.create({
                data: {
                    fullname,
                    email,
                    phone_number,
                    password: hashedPassword,
                    total_point: 0,
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
        }
        catch (error) {
            console.error("Error registering user:", error);
            next(error);
        }
    });
}
