import multer from "multer";
import path from "path";
import fs from "fs";

// ==========================================================
// CREATE UPLOAD DIRECTORIES
// ==========================================================

const uploadDirectory = "uploads";

const photoDirectory = path.join(uploadDirectory, "photos");
const userFileDirectory = path.join(uploadDirectory, "userfiles");

if (!fs.existsSync(photoDirectory)) {
    fs.mkdirSync(photoDirectory, { recursive: true });
}

if (!fs.existsSync(userFileDirectory)) {
    fs.mkdirSync(userFileDirectory, { recursive: true });
}

// ==========================================================
// DISK STORAGE
// ==========================================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        if (file.fieldname === "Photo") {
            cb(null, photoDirectory);
        }
        else if (file.fieldname === "UserFile") {
            cb(null, userFileDirectory);
        }
        else {
            cb(new Error("Invalid file field"));
        }
    },

    filename: (req, file, cb) => {

        const extension = path.extname(file.originalname);

        const fileName =
            `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;

        cb(null, fileName);
    }
});

// ==========================================================
// FILE FILTER
// ==========================================================

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "application/pdf"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(
            new Error(
                "Only JPG, JPEG, PNG, WEBP and PDF files are allowed"
            ),
            false
        );
    }
};

// ==========================================================
// MULTER CONFIGURATION
// ==========================================================

export const uploadUserPhoto = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }
});