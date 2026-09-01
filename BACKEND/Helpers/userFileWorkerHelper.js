import { Worker } from "worker_threads";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const processUserFilesUsingWorker = (
    inputPaths
) => {

    return new Promise((resolve, reject) => {

        if (
            !Array.isArray(inputPaths) ||
            inputPaths.length === 0
        ) {
            return reject(
                new Error("UserFile paths are missing")
            );
        }


        const uploadsDirectory =
            process.env.UPLOADS_DIRECTORY;


        if (!uploadsDirectory) {
            return reject(
                new Error(
                    "UPLOADS_DIRECTORY is not configured in .env"
                )
            );
        }


        const workerPath =
            path.resolve(
                __dirname,
                "../Workers/userFileWorker.js"
            );


        const worker =
            new Worker(
                workerPath,
                {
                    workerData: {
                        inputPaths,
                        uploadsDirectory
                    }
                }
            );


        let finished = false;


        worker.on("message", (message) => {

            if (finished) {
                return;
            }


            if (
                message &&
                message.success === true &&
                typeof message.filePath === "string"
            ) {

                finished = true;

                resolve({
                    filePath: message.filePath
                });

                return;
            }


            finished = true;

            reject(
                new Error(
                    message?.error ||
                    "Worker failed to process UserFile"
                )
            );

        });


        worker.on("error", (error) => {

            if (!finished) {

                finished = true;

                reject(error);

            }

        });


        worker.on("exit", (code) => {

            if (
                code !== 0 &&
                !finished
            ) {

                finished = true;

                reject(
                    new Error(
                        `Worker stopped with exit code ${code}`
                    )
                );

            }

        });

    });

};