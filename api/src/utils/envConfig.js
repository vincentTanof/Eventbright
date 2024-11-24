"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NODEMAILER_PASS = exports.NODEMAILER_EMAIL = exports.BASE_WEB_URL = exports.SECRET_KEY = exports.PORT = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({
    path: ".env",
});
_a = process.env, exports.PORT = _a.PORT, exports.SECRET_KEY = _a.SECRET_KEY, exports.BASE_WEB_URL = _a.BASE_WEB_URL, exports.NODEMAILER_EMAIL = _a.NODEMAILER_EMAIL, exports.NODEMAILER_PASS = _a.NODEMAILER_PASS;
