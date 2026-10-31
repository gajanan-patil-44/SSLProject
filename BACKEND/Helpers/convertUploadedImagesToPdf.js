
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { MAX_FILE_SIZE } from "../MiddleWare/Uploads.js";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

// ==========================================================
// VALIDATE UPLOADED FILE
// ==========================================================

const validateFile = async (file) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const stats = await fs.stat(file.path);

    // Validate original file size.
    if (stats.size > MAX_FILE_SIZE) {
        throw new Error(
            `${file.originalname} must not exceed 1 MB`
        );
    }

    if (stats.size === 0) {
        throw new Error(`${file.originalname} is empty`);
    }

    // Photo must be an image.
    if (file.fieldname === "Photo" && extension === ".pdf") {
        throw new Error(
            "Photo must be uploaded as JPG, JPEG, PNG or WEBP"
        );
    }

    // Validate existing PDF without converting it.
    if (extension === ".pdf") {
        if (file.fieldname !== "UserFile") {
            throw new Error(
                "PDF files are allowed only for UserFile"
            );
        }

        const buffer = await fs.readFile(file.path);

        if (buffer.subarray(0, 5).toString() !== "%PDF-") {
            throw new Error(
                `${file.originalname} is not a valid PDF`
            );
        }

        await PDFDocument.load(buffer);
        return;
    }

    // Validate supported image extension.
    if (!IMAGE_EXTENSIONS.includes(extension)) {
        throw new Error(
            `Unsupported file type: ${file.originalname}`
        );
    }

    // Validate actual image content.
    try {
        await sharp(file.path, { failOn: "error" }).metadata();
    } catch {
        throw new Error(
            `${file.originalname} is not a valid supported image`
        );
    }
};

// ==========================================================
// CONVERT IMAGE TO PDF
// ==========================================================

const convertImageToPdf = async (file) => {
    const extension = path.extname(file.originalname).toLowerCase();

    // If already PDF, do not convert again.
    if (extension === ".pdf") {
        return;
    }

    // Convert image to JPEG in memory.
    const imageBuffer = await sharp(file.path)
        .rotate()
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: 85 })
        .toBuffer();

    // Create PDF.
    const pdfDocument = await PDFDocument.create();
    const image = await pdfDocument.embedJpg(imageBuffer);

    const width = image.width * 0.75;
    const height = image.height * 0.75;

    const page = pdfDocument.addPage([width, height]);

    page.drawImage(image, {
        x: 0,
        y: 0,
        width,
        height
    });

    const pdfBuffer = Buffer.from(await pdfDocument.save());

    // Generate PDF path in the same directory.
    const pdfPath = file.path.replace(/\.[^.]+$/, ".pdf");

    // Save PDF first.
    await fs.writeFile(pdfPath, pdfBuffer);

    // Delete original image after successful conversion.
    await fs.unlink(file.path);

    // Update file information for the controller.
    file.path = pdfPath;
    file.filename = path.basename(pdfPath);
    file.destination = path.dirname(pdfPath);

    file.originalname =
        `${path.basename(file.originalname, extension)}.pdf`;

    file.mimetype = "application/pdf";
    file.size = pdfBuffer.length;
};

// ==========================================================
// PROCESS ALL UPLOADED FILES
// ==========================================================

export const convertUploadedImagesToPdf = async (
    uploadedFiles = []
) => {
    // Validate every file before converting.
    for (const file of uploadedFiles) {
        await validateFile(file);
    }

    // Convert images only. PDFs remain unchanged.
    for (const file of uploadedFiles) {
        await convertImageToPdf(file);
    }

    return uploadedFiles;
};
