
import "dotenv/config";
import multer from "multer";
import path from "path";
import fs from "fs";

// =====================================================
// MATERIAL UPLOAD DIRECTORY
// =====================================================

const uploadDirectory = path.resolve(
    process.env.MATERIAL_UPLOAD_DIR || "./uploads/Materials"
);

// Create upload directory if it does not exist
fs.mkdirSync(uploadDirectory, { recursive: true });

// =====================================================
// MULTER DISK STORAGE
// =====================================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {

        const extension = path
            .extname(file.originalname)
            .toLowerCase();

        const filename =
            `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
            extension;

        cb(null, filename);
    }
});

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const upload = multer({

    storage,

    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB per file
        files: 10
    },

    fileFilter: (req, file, cb) => {

        const allowedExtensions = [
            ".pdf",
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        ];

        const extension = path
            .extname(file.originalname)
            .toLowerCase();

        if (allowedExtensions.includes(extension)) {
            return cb(null, true);
        }

        return cb(
            new Error(
                "Only PDF, JPG, JPEG, PNG and WEBP files are allowed"
            )
        );
    }
});

// =====================================================
// EXPORT MULTER
// =====================================================

export default upload;
