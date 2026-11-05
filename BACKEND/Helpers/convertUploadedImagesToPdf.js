<<<<<<< HEAD

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
=======
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export const convertUploadedImagesToPdf = async (
    uploadedFiles,
    fileTypeIds
) => {
    const photoFiles = uploadedFiles.filter(
        file => file.fieldname === "Photo"
    );

    const userFiles = uploadedFiles.filter(
        file => file.fieldname === "UserFile"
    );

    // Only one Photo is allowed
    if (photoFiles.length > 1) {
        throw new Error("Only one Photo can be uploaded");
    }

    const normalizedFileTypeIds = Array.isArray(fileTypeIds)
        ? fileTypeIds
        : fileTypeIds
            ? [fileTypeIds]
            : [];

    if (userFiles.length !== normalizedFileTypeIds.length) {
        throw new Error(
            "Each UserFile must have one matching FileTypeId"
        );
    }

    // Assign FileTypeId to each UserFile
    userFiles.forEach((file, index) => {
        const id = Number(normalizedFileTypeIds[index]);

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("Invalid FileTypeId");
        }

        file.FileTypeId = id;
    });

    const generatedFiles = [];
    const originalFilesToDelete = [];

    // ======================================================
    // 1. PHOTO - CONVERT IMAGE TO ONE PDF
    // ======================================================

    if (photoFiles.length === 1) {
        const photo = photoFiles[0];

        const extension = path.extname(
            photo.originalname
        ).toLowerCase();

        if (!IMAGE_EXTENSIONS.includes(extension)) {
            throw new Error(
                "Photo must be JPG, JPEG, PNG or WEBP"
            );
        }

        const imageBuffer = await fs.readFile(photo.path);

        const jpegBuffer = await sharp(imageBuffer)
            .rotate()
            .flatten({ background: "#ffffff" })
            .jpeg({ quality: 90 })
            .toBuffer();

        const photoPdf = await PDFDocument.create();

        const embeddedImage = await photoPdf.embedJpg(jpegBuffer);

        const page = photoPdf.addPage([
            embeddedImage.width,
            embeddedImage.height
        ]);

        page.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: embeddedImage.width,
            height: embeddedImage.height
        });

        const pdfBytes = await photoPdf.save();

        const outputDirectory = path.dirname(photo.path);

        const outputFilename =
            `Photo_${randomUUID()}.pdf`;

        const outputPath = path.join(
            outputDirectory,
            outputFilename
        );

        await fs.writeFile(outputPath, pdfBytes);

        generatedFiles.push({
            ...photo,
            fieldname: "Photo",
            originalname: outputFilename,
            filename: outputFilename,
            path: outputPath,
            mimetype: "application/pdf",
            size: pdfBytes.length
        });

        originalFilesToDelete.push(photo.path);
    }

    // ======================================================
    // 2. USER FILES - GROUP BY FILE TYPE ID
    // ======================================================

    const groupedFiles = new Map();

    for (const file of userFiles) {
        if (!groupedFiles.has(file.FileTypeId)) {
            groupedFiles.set(file.FileTypeId, []);
        }

        groupedFiles.get(file.FileTypeId).push(file);
    }

    // ======================================================
    // 3. CREATE ONE MERGED PDF PER FILE TYPE
    // ======================================================

    for (const [fileTypeId, files] of groupedFiles) {
        const mergedPdf = await PDFDocument.create();

        for (const file of files) {
            const extension = path.extname(
                file.originalname
            ).toLowerCase();

            if (extension === ".pdf") {
                const pdfBytes = await fs.readFile(file.path);

                const existingPdf = await PDFDocument.load(
                    pdfBytes
                );

                const copiedPages = await mergedPdf.copyPages(
                    existingPdf,
                    existingPdf.getPageIndices()
                );

                copiedPages.forEach(page => {
                    mergedPdf.addPage(page);
                });
            } else if (IMAGE_EXTENSIONS.includes(extension)) {
                const imageBuffer = await fs.readFile(file.path);

                const jpegBuffer = await sharp(imageBuffer)
                    .rotate()
                    .flatten({ background: "#ffffff" })
                    .jpeg({ quality: 90 })
                    .toBuffer();

                const image = await mergedPdf.embedJpg(jpegBuffer);

                const page = mergedPdf.addPage([
                    image.width,
                    image.height
                ]);

                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height
                });
            } else {
                throw new Error(
                    `Unsupported UserFile format: ${extension}`
                );
            }
        }

        const pdfBytes = await mergedPdf.save();

        const outputDirectory = path.dirname(files[0].path);

        const outputFilename =
            `UserFile_${fileTypeId}_${randomUUID()}.pdf`;

        const outputPath = path.join(
            outputDirectory,
            outputFilename
        );

        await fs.writeFile(outputPath, pdfBytes);

        generatedFiles.push({
            ...files[0],
            fieldname: "UserFile",
            originalname: outputFilename,
            filename: outputFilename,
            path: outputPath,
            destination: outputDirectory,
            mimetype: "application/pdf",
            size: pdfBytes.length,
            FileTypeId: fileTypeId
        });

        files.forEach(file => {
            originalFilesToDelete.push(file.path);
        });
    }

    // ======================================================
    // 4. DELETE ORIGINAL IMAGES AND PDF FILES
    // ======================================================

    for (const filePath of originalFilesToDelete) {
        await fs.unlink(filePath);
    }

    // Return only generated PDFs
    const otherFiles = uploadedFiles.filter(
        file =>
            file.fieldname !== "Photo" &&
            file.fieldname !== "UserFile"
    );

    return [
        ...otherFiles,
        ...generatedFiles
    ];
};
>>>>>>> f42fe0e3df83107e70003ef2614b54218b50bd91
