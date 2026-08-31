import { Worker } from "worker_threads";
import path from "path";
import { fileURLToPath } from "url";


// ==========================================================
// __DIRNAME
// ==========================================================

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);


// ==========================================================
// PROCESS USER FILE USING WORKER
// ==========================================================

export const processUserFileUsingWorker = (
    inputPath
) => {

    return new Promise((resolve, reject) => {

        try {

            // ==================================================
            // VALIDATE INPUT PATH
            // ==================================================

            if (!inputPath) {

                return reject(
                    new Error(
                        "UserFile path is missing"
                    )
                );

            }


            // ==================================================
            // UPLOADS DIRECTORY
            // ==================================================

            const uploadsDirectory =
                "C:\\Users\\hithi\\OneDrive\\Desktop\\Repoting system\\Business-Operations-Management-System-BOMS-\\uploads";


            // ==================================================
            // WORKER PATH
            // ==================================================

            const workerPath =
                path.resolve(
                    __dirname,
                    "../Workers/userFileWorker.js"
                );


            // ==================================================
            // CREATE WORKER
            // ==================================================

            const worker =
                new Worker(
                    workerPath,
                    {
                        workerData: {

                            inputPath,

                            uploadsDirectory

                        }
                    }
                );


            // ==================================================
            // WORKER MESSAGE
            // ==================================================

            worker.on(
                "message",
                (message) => {

                    if (
                        message &&
                        message.success === true &&
                        typeof message.filePath === "string"
                    ) {

                        resolve({

                            filePath:
                                message.filePath

                        });

                        return;
                    }


                    reject(
                        new Error(
                            message?.error ||
                            "Worker failed to process UserFile"
                        )
                    );

                }
            );


            // ==================================================
            // WORKER ERROR
            // ==========================================================

            worker.on(
                "error",
                (error) => {

                    reject(error);

                }
            );


            // ==================================================
            // WORKER EXIT
            // ==========================================================

            worker.on(
                "exit",
                (code) => {

                    if (code !== 0) {

                        reject(
                            new Error(
                                `Worker stopped with exit code ${code}`
                            )
                        );

                    }

                }
            );

        } catch (error) {

            reject(error);

        }

    });

};