"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleUploader = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = require("path");
const SingleUploader = (filePrefix, folderName) => {
    const maxSize = 1 * 1024 * 1024;
    const defaultDir = (0, path_1.join)(__dirname, "../../public");
    console.log(defaultDir);
    const storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            const destination = folderName ? defaultDir + folderName : defaultDir;
            cb(null, destination);
        },
        filename: (req, file, cb) => {
            const originalNameParts = file.originalname.split(".");
            // Nama File
            console.log(originalNameParts);
            const fileExtension = originalNameParts[originalNameParts.length - 1];
            const newFileName = filePrefix + Date.now() + "." + fileExtension;
            cb(null, newFileName);
        },
    });
    return (0, multer_1.default)({ storage: storage, limits: { fileSize: maxSize } }).single("file");
};
exports.SingleUploader = SingleUploader;
