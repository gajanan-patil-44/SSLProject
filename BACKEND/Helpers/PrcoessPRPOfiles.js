import { convertImagesToPdf} from "./PRPOconvertimgtopdf.js";

export const processPRPOFiles = async (files, fileTypeIds) => {

    const groupedFiles = {};

    files.forEach((file, index) => {

        const fileTypeId = Number(fileTypeIds[index]);

        if (!groupedFiles[fileTypeId]) {
            groupedFiles[fileTypeId] = [];
        }

        groupedFiles[fileTypeId].push(file);
    });

    const processedFiles = [];

    const processedFileTypeIds = [];

    for (const [fileTypeId, group] of Object.entries(groupedFiles)) {

        const pdfFiles = group.filter(
            file => file.mimetype === "application/pdf"
        );

        const imageFiles = group.filter(
            file => file.mimetype.startsWith("image/")
        );

        // Keep uploaded PDFs unchanged
        for (const file of pdfFiles) {

            processedFiles.push(file);

            processedFileTypeIds.push(Number(fileTypeId));
        }

        // Combine multiple images belonging to the same FileTypeId
        const convertedFiles = await convertImagesToPdf(imageFiles);

        for (const file of convertedFiles) {

            processedFiles.push(file);

            processedFileTypeIds.push(Number(fileTypeId));
        }
    }

    return {
        processedFiles,
        processedFileTypeIds
    };
};