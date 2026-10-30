
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = process.env.UPLOADS_DIRECTORY;

if (!uploadDirectory) {
    throw new Error("UPLOADS_DIRECTORY is missing in .env");
}

export const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"];

const uploadConfig = {
    Photo: {
        directory: path.join(uploadDirectory, "photos"),
        allowedExtensions: imageExtensions
    },
    UserFile: {
        directory: path.join(uploadDirectory, "userfiles"),
        allowedExtensions: [...imageExtensions, ".pdf"]
    }
};

// Create upload directories.
for (const config of Object.values(uploadConfig)) {
    fs.mkdirSync(config.directory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const config = uploadConfig[file.fieldname];

        if (!config) {
            return cb(
                new Error(
                    `Unsupported file field: ${file.fieldname}. ` +
                    "Allowed fields: Photo, UserFile"
                )
            );
        }

        cb(null, config.directory);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();

        const filename =
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    const config = uploadConfig[file.fieldname];

    if (!config) {
        return cb(
            new Error(`Unsupported file field: ${file.fieldname}`)
        );
    }

    const extension = path.extname(file.originalname).toLowerCase();

    if (!config.allowedExtensions.includes(extension)) {
        const message =
            file.fieldname === "Photo"
                ? "Photo must be JPG, JPEG, PNG or WEBP. PDF is not allowed."
                : "UserFile must be JPG, JPEG, PNG, WEBP or PDF.";

        return cb(new Error(message));
    }
    cb(null, true);
};

export const uploadUserPhoto = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 11,
        fields: 100
    }
});
