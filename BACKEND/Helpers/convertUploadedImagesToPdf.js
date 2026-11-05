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
