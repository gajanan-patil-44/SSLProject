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
            cb(new Error("Invalid file field"), false);
        }
    },

    filename: (req, file, cb) => {

        const extension = path.extname(file.originalname).toLowerCase();

        const fileName =
            `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;

        cb(null, fileName);
    }
});

// ==========================================================
// FILE FILTER
// ==========================================================

const fileFilter = (req, file, cb) => {

    const allowedExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".pdf"
    ];

    const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "application/pdf",
        "application/x-pdf"
    ];

    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    const isValidExtension =
        allowedExtensions.includes(extension);

    const isValidMimeType =
        allowedMimeTypes.includes(file.mimetype);

    if (isValidExtension && isValidMimeType) {
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