
import multer from "multer";

export const uploadErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                status: "error",
                message: "Each uploaded file must not exceed 1 MB"
            });
        }

        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                status: "error",
                message: "A maximum of 11 files is allowed"
            });
        }

        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                status: "error",
                message: `Unexpected file field: ${err.field}`
            });
        }

        return res.status(400).json({
            status: "error",
            message: err.message || "File upload failed"
        });
    }

    return res.status(400).json({
        status: "error",
        message: err?.message || "File upload failed"
    });
};
