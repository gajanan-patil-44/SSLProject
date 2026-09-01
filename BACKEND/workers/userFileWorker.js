import {
    parentPort,
    workerData
} from "worker_threads";

import fs from "fs";
import path from "path";

import sharp from "sharp";
import PDFDocument from "pdfkit";


// ==========================================================
// WORKER DATA
// ==========================================================

const {
    inputPaths,
    uploadsDirectory
} = workerData;


// ==========================================================
// IMAGE -> PDF
// ==========================================================

const convertImagesToPdf = async (
    imagePaths,
    outputPath
) => {

    await new Promise(
        async (resolve, reject) => {

            try {

                const pdf =
                    new PDFDocument({
                        autoFirstPage: false
                    });


                const outputStream =
                    fs.createWriteStream(
                        outputPath
                    );


                outputStream.on(
                    "finish",
                    resolve
                );


                outputStream.on(
                    "error",
                    reject
                );


                pdf.on(
                    "error",
                    reject
                );


                pdf.pipe(
                    outputStream
                );


                // ==================================================
                // ADD EVERY IMAGE AS A PAGE
                // ==================================================

                for (
                    const imagePath
                    of imagePaths
                ) {

                    // ==============================================
                    // READ IMAGE METADATA
                    // ==============================================

                    const metadata =
                        await sharp(
                            imagePath
                        ).metadata();


                    const width =
                        metadata.width || 595;


                    const height =
                        metadata.height || 842;


                    // ==============================================
                    // ADD PAGE FOR THIS IMAGE
                    // ==============================================

                    pdf.addPage({

                        size: [
                            width,
                            height
                        ],

                        margin: 0

                    });


                    // ==============================================
                    // ADD IMAGE
                    // ==============================================

                    pdf.image(
                        imagePath,
                        0,
                        0,
                        {
                            width,
                            height
                        }
                    );

                }


                // ==================================================
                // FINISH PDF
                // ==================================================

                pdf.end();

            } catch (error) {

                reject(error);

            }

        }
    );

};


// ==========================================================
// COPY PDF
// ==========================================================

const copyPdf = async (
    inputPath,
    outputPath
) => {

    await fs.promises.copyFile(
        inputPath,
        outputPath
    );

};


// ==========================================================
// GET FILE TYPE
// ==========================================================

const getFileType = (
    inputPath
) => {

    const extension =
        path.extname(
            inputPath
        ).toLowerCase();


    if (
        extension === ".pdf"
    ) {

        return "pdf";

    }


    if (
        [
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
            ".gif",
            ".tiff",
            ".tif",
            ".bmp"
        ].includes(extension)
    ) {

        return "image";

    }


    return "unsupported";

};


// ==========================================================
// WORKER
// ==========================================================

(async () => {

    try {

        // ==================================================
        // VALIDATE INPUT PATHS
        // ==================================================

        if (
            !Array.isArray(inputPaths) ||
            inputPaths.length === 0
        ) {

            throw new Error(
                "inputPaths are missing"
            );

        }


        // ==================================================
        // VALIDATE UPLOAD DIRECTORY
        // ==================================================

        if (!uploadsDirectory) {

            throw new Error(
                "uploadsDirectory is missing"
            );

        }


        // ==================================================
        // MAKE SURE UPLOADS DIRECTORY EXISTS
        // ==================================================

        await fs.promises.mkdir(
            uploadsDirectory,
            {
                recursive: true
            }
        );


        // ==================================================
        // VALIDATE EVERY INPUT FILE
        // ==================================================

        for (
            const inputPath
            of inputPaths
        ) {

            if (!inputPath) {

                throw new Error(
                    "One of the input paths is missing"
                );

            }


            try {

                await fs.promises.access(
                    inputPath,
                    fs.constants.F_OK
                );

            } catch {

                throw new Error(
                    `Input file does not exist: ${inputPath}`
                );

            }

        }


        // ==================================================
        // DETERMINE FILE TYPES
        // ==================================================

        const fileTypes =
            inputPaths.map(
                inputPath =>
                    getFileType(
                        inputPath
                    )
            );


        // ==================================================
        // CHECK UNSUPPORTED FILES
        // ==================================================

        const unsupportedIndex =
            fileTypes.findIndex(
                type =>
                    type === "unsupported"
            );


        if (
            unsupportedIndex !== -1
        ) {

            throw new Error(
                `Unsupported file type: ${inputPaths[unsupportedIndex]}`
            );

        }


        // ==================================================
        // EXISTING PDF
        //
        // For PDF, only one PDF should be supplied
        // for a FileTypeId.
        // ==================================================

        if (
            inputPaths.length === 1 &&
            fileTypes[0] === "pdf"
        ) {

            const inputPath =
                inputPaths[0];


            const originalName =
                path.basename(
                    inputPath,
                    path.extname(
                        inputPath
                    )
                );


            const pdfFileName =
                `${originalName}_${Date.now()}.pdf`;


            const outputPath =
                path.join(
                    uploadsDirectory,
                    pdfFileName
                );


            // ==============================================
            // COPY PDF
            // ==============================================

            await copyPdf(
                inputPath,
                outputPath
            );


            // ==============================================
            // RETURN PATH
            // ==============================================

            parentPort.postMessage({

                success: true,

                filePath:
                    `uploads/${pdfFileName}`

            });


            return;

        }


        // ==================================================
        // IMAGES
        // ==================================================

        const allImages =
            fileTypes.every(
                type =>
                    type === "image"
            );


        if (allImages) {

            // ==============================================
            // FIRST IMAGE NAME
            // ==============================================

            const firstImage =
                inputPaths[0];


            const originalName =
                path.basename(
                    firstImage,
                    path.extname(
                        firstImage
                    )
                );


            // ==============================================
            // PDF FILE NAME
            // ==============================================

            const pdfFileName =
                `${originalName}_${Date.now()}.pdf`;


            // ==============================================
            // FINAL OUTPUT PATH
            // ==============================================

            const outputPath =
                path.join(
                    uploadsDirectory,
                    pdfFileName
                );


            // ==============================================
            // CONVERT ALL IMAGES TO ONE PDF
            // ==============================================

            await convertImagesToPdf(
                inputPaths,
                outputPath
            );


            // ==============================================
            // RETURN PATH
            // ==============================================

            parentPort.postMessage({

                success: true,

                filePath:
                    `uploads/${pdfFileName}`

            });


            return;

        }


        // ==================================================
        // MIXED PDF + IMAGE
        // ==================================================

        throw new Error(
            "A FileTypeId cannot contain both PDF and image files"
        );


    } catch (error) {

        console.error(
            "Worker Error:",
            error
        );


        parentPort.postMessage({

            success: false,

            error:
                error.message

        });

    }

})();





