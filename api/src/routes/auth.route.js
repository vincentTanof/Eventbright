"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller"); // Ensure this path is correct
const router = (0, express_1.Router)();
// Route for user registration
router.post("/register", auth_controller_1.registerUser);

// Route for post registration
router.post("/login", auth_controller_1.loginUser);

exports.default = router;
