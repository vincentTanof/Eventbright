"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginValidation = exports.RegisterValidation = void 0;
const express_validator_1 = require("express-validator");
exports.RegisterValidation = [
    // Email ga boleh kosong lalu itu email apa bukan
    (0, express_validator_1.body)("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid Email"),
    (0, express_validator_1.body)("name")
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 3 })
        .withMessage("Nmae must be 3 characters minimum"),
    (0, express_validator_1.body)("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 3 })
        .withMessage("Passcowrd must be 3 characters minimum")
        .matches(/^(?=.*[\d])(?=.*[!@#$%^&*])[\w!@#$%^&*]{6,16}$/)
        .withMessage("Password need to have at least 1 number and special characters"),
    (req, res, next) => {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            console.log(errors);
            if (!errors.isEmpty())
                throw new Error(errors.array()[0].msg);
            next();
        }
        catch (err) {
            next(err);
        }
    }
];
exports.LoginValidation = [
    (0, express_validator_1.body)("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid Email"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
    (req, res, next) => {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            console.log(errors);
            if (!errors.isEmpty())
                throw new Error(errors.array()[0].msg);
            next();
        }
        catch (err) {
            next(err);
        }
    }
];
