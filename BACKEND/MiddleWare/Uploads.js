
import multer from "multer";
import path from "path";
import fs from "fs";

// ==========================================================
// UPLOAD CONFIGURATION
// ==========================================================

// Read the base directory from .env
const uploadDirectory = process.env.UPLOADS_DIRECTORY;

if (!uploadDirectory) {
    throw new Error(
        "UPLOADS_DIRECTORY is missing in the .env file"
    );
}

const MB = 1024 * 1024;
const MAX_FILE_SIZE = 10 * MB;

// ==========================================================
// ALLOWED FILE EXTENSIONS
// ==========================================================

const allowedExtensions = [
    // Images
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",

    // Documents
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".csv",
    ".txt"
];

// ==========================================================
// UPLOAD CONFIGURATION BY FIELD NAME
// ==========================================================

const uploadConfig = {
    Photo: {
        directory: path.join(uploadDirectory, "photos"),
        allowedExtensions: [
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        ]
    },

    UserFile: {
        directory: path.join(uploadDirectory, "userfiles"),
        allowedExtensions
    }
};

// ==========================================================
// CREATE UPLOAD DIRECTORIES
// ==========================================================

Object.values(uploadConfig).forEach(({ directory }) => {
    fs.mkdirSync(directory, {
        recursive: true
    });
});

// ==========================================================
// DISK STORAGE
// ==========================================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const config = uploadConfig[file.fieldname];

        if (!config) {
            return cb(
                new Error(
                    `Unsupported file field: ${file.fieldname}`
                )
            );
        }

        cb(null, config.directory);
    },

    filename: (req, file, cb) => {
        const extension = path
            .extname(file.originalname)
            .toLowerCase();

        const uniqueFileName =
            `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;

        cb(null, uniqueFileName);
    }
});

// ==========================================================
// FILE FILTER
// ==========================================================

const fileFilter = (req, file, cb) => {
    const config = uploadConfig[file.fieldname];

    if (!config) {
        return cb(
            new Error(
                `Unsupported file field: ${file.fieldname}`
            )
        );
    }

    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    if (!config.allowedExtensions.includes(extension)) {
        return cb(
            new Error(
                `Unsupported file type for ${file.fieldname}. ` +
                `Allowed formats: ${config.allowedExtensions.join(", ")}`
            )
        );
    }

    cb(null, true);
};

// ==========================================================
// MULTER CONFIGURATION
// ==========================================================

export const uploadUserPhoto = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
});
