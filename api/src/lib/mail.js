"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
// For sending mail for our nodemailer
const nodemailer_1 = __importDefault(require("nodemailer"));
const envConfig_1 = require("../utils/envConfig");
exports.transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: envConfig_1.NODEMAILER_EMAIL,
        pass: envConfig_1.NODEMAILER_PASS,
    },
});
