import multer from "multer";
import path from "path";
import fs from "fs";

 const uploadDir = path.resolve(process.env.PRPO_UPLOAD_DIR);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {

        const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;

        cb(null, uniqueName);
    }
});


const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF, JPG, JPEG, PNG and Word files are allowed."));
    }
};


export const uploadPRPOFiles = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 10
    }

})