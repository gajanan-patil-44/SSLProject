import "dotenv/config";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.resolve(
    process.env.MATERIAL_UPLOAD_DIR
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();

        const filename =
            `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
            extension;

        cb(null, filename);
    }
});

const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024,
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

        const extension = path.extname(file.originalname).toLowerCase();

        if (allowedExtensions.includes(extension)) {
            return cb(null, true);
        }

        cb(
            new Error(
                "Only PDF, JPG, JPEG, PNG and WEBP files are allowed"
            )
        );
    }
});

export default upload;