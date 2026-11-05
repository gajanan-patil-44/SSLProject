import fs from "fs/promises";
import path from "path";
import { PDFDocument } from "pdf-lib";
import { randomUUID } from "crypto";

export const convertImagesToPdf = async (files) => {

    if (files.length <= 1) {
        return files;
    }

    const pdfDoc = await PDFDocument.create();

    for (const file of files) {

        const imageBytes = await fs.readFile(file.path);

        let image;

        if (file.mimetype === "image/jpeg" ||
            file.mimetype === "image/jpg") {

            image = await pdfDoc.embedJpg(imageBytes);

        } else if (file.mimetype === "image/png") {

            image = await pdfDoc.embedPng(imageBytes);

        } else {

            throw new Error(
                `Unsupported image format: ${file.mimetype}`
            );
        }

        const { width, height } = image;

        const page = pdfDoc.addPage([width, height]);

        page.drawImage(image, {
            x: 0,
            y: 0,
            width,
            height
        });
    }

    const pdfBytes = await pdfDoc.save();

    const outputDirectory = path.dirname(files[0].path);

    const outputName = `PRPO_${randomUUID()}.pdf`;

    const outputPath = path.join(
        outputDirectory,
        outputName
    );

    await fs.writeFile(outputPath, pdfBytes);

    // Delete original images after successful PDF creation
    await Promise.all(
        files.map(file => fs.unlink(file.path))
    );

    return [{
        originalname: outputName,
        filename: outputName,
        path: outputPath,
        mimetype: "application/pdf",
        size: pdfBytes.length
    }];
};