import {
    parentPort,
    workerData
} from "worker_threads";

import fs from "fs";
import path from "path";

import sharp from "sharp";
import PDFDocument from "pdfkit";


// ==========================================================
// IMAGE -> PDF
// ==========================================================

const convertImageToPdf = async (
    inputPath,
    outputPath
) => {

    const metadata =
        await sharp(inputPath).metadata();


    const width =
        metadata.width || 595;

    const height =
        metadata.height || 842;


    await new Promise(
        (resolve, reject) => {

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


            pdf.pipe(outputStream);


            pdf.addPage({

                size: [
                    width,
                    height
                ],

                margin: 0

            });


            pdf.image(
                inputPath,
                0,
                0,
                {
                    width: width,
                    height: height
                }
            );


            pdf.end();

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
// WORKER
// ==========================================================

(async () => {

    try {

        const {
            inputPath,
            originalFileName,
            mimeType,
            uploadsDirectory
        } = workerData;


        // ==================================================
        // VALIDATE INPUT
        // ==================================================

        if (!inputPath) {

            throw new Error(
                "inputPath is missing"
            );

        }


        if (!originalFileName) {

            throw new Error(
                "originalFileName is missing"
            );

        }


        if (!mimeType) {

            throw new Error(
                "mimeType is missing"
            );

        }


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
        // FILE NAME WITHOUT EXTENSION
        // ==================================================

        const originalName =
            path.basename(
                originalFileName,
                path.extname(
                    originalFileName
                )
            );


        // ==================================================
        // CREATE UNIQUE PDF NAME
        // ==================================================

        const pdfFileName =
            `${originalName}_${Date.now()}.pdf`;


        // ==================================================
        // FINAL PHYSICAL PATH
        // ==================================================

        const outputPath =
            path.join(
                uploadsDirectory,
                pdfFileName
            );


        // ==================================================
        // PDF FILE
        // ==================================================

        if (
            mimeType === "application/pdf"
        ) {

            console.log(
                "Worker: PDF received"
            );


            console.log(
                "Worker: Copying PDF to:",
                outputPath
            );


            await copyPdf(
                inputPath,
                outputPath
            );


            // ==================================================
            // RETURN PATH
            // ==================================================

            parentPort.postMessage({

                success: true,

                filePath:
                    `uploads/${pdfFileName}`

            });


            return;
        }


        // ==================================================
        // IMAGE FILE
        // ==================================================

        if (
            mimeType.startsWith("image/")
        ) {

            console.log(
                "Worker: Image received"
            );


            console.log(
                "Worker: Converting image to:",
                outputPath
            );


            await convertImageToPdf(
                inputPath,
                outputPath
            );


            // ==================================================
            // RETURN PATH
            // ==================================================

            parentPort.postMessage({

                success: true,

                filePath:
                    `uploads/${pdfFileName}`

            });


            return;
        }


        // ==================================================
        // UNSUPPORTED FILE
        // ==================================================

        throw new Error(
            `Unsupported file type: ${mimeType}`
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