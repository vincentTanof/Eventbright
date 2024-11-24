"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ErrorMiddleware;
function ErrorMiddleware(err, req, res, next) {
    res.status(500).send({
        message: err.message,
    });
}
