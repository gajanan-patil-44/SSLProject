import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

// ==========================================================
// CONVERT UPLOADED IMAGES TO PDF
// ==========================================================

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

    const generatedFiles = [];

    // ======================================================
    // 1. PHOTO VALIDATION
    // ======================================================

    if (photoFiles.length > 1) {
        throw new Error("Only one Photo can be uploaded");
    }

    // ======================================================
    // 2. PHOTO - ONLY IMAGE ALLOWED
    // ======================================================

    if (photoFiles.length === 1) {

        const photo = photoFiles[0];

        const extension = path.extname(
            photo.originalname
        ).toLowerCase();

        if (!IMAGE_EXTENSIONS.includes(extension)) {
            throw new Error(
                "Photo must be JPG, JPEG, PNG or WEBP. PDF is not allowed."
            );
        }

        const imageBuffer = await fs.readFile(photo.path);

        const jpegBuffer = await sharp(imageBuffer)
            .rotate()
            .flatten({ background: "#ffffff" })
            .jpeg({ quality: 90 })
            .toBuffer();

        const photoPdf = await PDFDocument.create();

        const embeddedImage = await photoPdf.embedJpg(
            jpegBuffer
        );

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

        const outputFilename = `Photo_${randomUUID()}.pdf`;

        const outputPath = path.join(
            outputDirectory,
            outputFilename
        );

        await fs.writeFile(outputPath, pdfBytes);

        // Delete original image after successful conversion
        await fs.unlink(photo.path);

        generatedFiles.push({
            ...photo,
            fieldname: "Photo",
            originalname: outputFilename,
            filename: outputFilename,
            path: outputPath,
            destination: outputDirectory,
            mimetype: "application/pdf",
            size: pdfBytes.length
        });
    }

    // ======================================================
    // 3. NORMALIZE FILE TYPE IDS
    // ======================================================

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

    // ======================================================
    // 4. VALIDATE FILE TYPE IDS
    // ======================================================

    userFiles.forEach((file, index) => {

        const id = Number(normalizedFileTypeIds[index]);

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error(
                `Invalid FileTypeId at position ${index + 1}`
            );
        }

        file.FileTypeId = id;
    });

    // ======================================================
    // 5. GROUP USER FILES BY FILE TYPE ID
    // ======================================================

    const groupedFiles = new Map();

    for (const file of userFiles) {

        const extension = path.extname(
            file.originalname
        ).toLowerCase();

        if (
            extension !== ".pdf" &&
            !IMAGE_EXTENSIONS.includes(extension)
        ) {
            throw new Error(
                `Unsupported UserFile format: ${extension}`
            );
        }

        if (!groupedFiles.has(file.FileTypeId)) {
            groupedFiles.set(file.FileTypeId, []);
        }

        groupedFiles.get(file.FileTypeId).push(file);
    }

    // ======================================================
    // 6. PROCESS EACH FILE TYPE GROUP
    // ======================================================

    for (const [fileTypeId, files] of groupedFiles) {

        const pdfFiles = files.filter(file =>
            path.extname(file.originalname).toLowerCase() === ".pdf"
        );

        const imageFiles = files.filter(file =>
            IMAGE_EXTENSIONS.includes(
                path.extname(file.originalname).toLowerCase()
            )
        );

        // --------------------------------------------------
        // VALIDATION: PDF AND IMAGE CANNOT BE MIXED
        // --------------------------------------------------

        if (pdfFiles.length > 0 && imageFiles.length > 0) {
            throw new Error(
                `FileTypeId ${fileTypeId}: Upload either PDF or images, not both.`
            );
        }

        // --------------------------------------------------
        // PDF: ONLY ONE PDF ALLOWED
        // --------------------------------------------------

        if (pdfFiles.length > 0) {

            if (pdfFiles.length > 1) {
                throw new Error(
                    `FileTypeId ${fileTypeId}: Only one PDF is allowed.`
                );
            }

            // Store original PDF directly. No conversion.
            generatedFiles.push({
                ...pdfFiles[0],
                fieldname: "UserFile",
                FileTypeId: fileTypeId
            });

            continue;
        }

        // --------------------------------------------------
        // IMAGES: MAXIMUM TWO IMAGES ALLOWED
        // --------------------------------------------------

        if (imageFiles.length > 2) {
            throw new Error(
                `FileTypeId ${fileTypeId}: Maximum two images are allowed.`
            );
        }

        // --------------------------------------------------
        // CONVERT IMAGE OR TWO IMAGES INTO ONE PDF
        // --------------------------------------------------

        const mergedPdf = await PDFDocument.create();

        for (const file of imageFiles) {

            const imageBuffer = await fs.readFile(file.path);

            const jpegBuffer = await sharp(imageBuffer)
                .rotate()
                .flatten({ background: "#ffffff" })
                .jpeg({ quality: 90 })
                .toBuffer();

            const image = await mergedPdf.embedJpg(
                jpegBuffer
            );

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
        }

        const pdfBytes = await mergedPdf.save();

        const outputDirectory = path.dirname(
            imageFiles[0].path
        );

        const outputFilename =
            `UserFile_${fileTypeId}_${randomUUID()}.pdf`;

        const outputPath = path.join(
            outputDirectory,
            outputFilename
        );

        // Save generated PDF
        await fs.writeFile(outputPath, pdfBytes);

        // Delete original images after successful conversion
        for (const file of imageFiles) {
            await fs.unlink(file.path);
        }

        generatedFiles.push({
            ...imageFiles[0],
            fieldname: "UserFile",
            originalname: outputFilename,
            filename: outputFilename,
            path: outputPath,
            destination: outputDirectory,
            mimetype: "application/pdf",
            size: pdfBytes.length,
            FileTypeId: fileTypeId
        });
    }

    // ======================================================
    // 7. RETURN FINAL FILES
    // ======================================================

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