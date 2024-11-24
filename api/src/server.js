"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Import configuration, middleware, and routes
const envConfig_1 = require("./utils/envConfig");
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const auth_route_1 = __importDefault(require("./routes/auth.route")); // Adjust the path if necessary
// Set the port from environment variables or default to 8000
const PORT = Number(envConfig_1.PORT) || 8000;
// Initialize the Express application
const app = (0, express_1.default)();
// Enable CORS to allow access from specific origins
app.use((0, cors_1.default)({
    origin: envConfig_1.BASE_WEB_URL || "http://localhost:3000",
    credentials: true,
}));
// Enable JSON request body parsing
app.use(express_1.default.json());
// Mount authentication routes
app.use("/auth", auth_route_1.default);
// Error handling middleware
app.use(error_middleware_1.default);
// Start the server and log a success message
app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
});
