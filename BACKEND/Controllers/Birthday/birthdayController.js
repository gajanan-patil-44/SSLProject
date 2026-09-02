import { processBirthdayEmails } from "../../Services/birthdayService.js";

import { getBirthdayMailLogs, getBirthdayMailLogById } from "../../Models/BirthdayModels.js";


// ==========================================================
// PROCESS BIRTHDAY EMAILS
// ==========================================================

export const processBirthdayMailController = async (
    req,
    res
) => {

    try {

        const result = await processBirthdayEmails();


        if (!result.success) {

            return res.status(500).json({

                status: "error",

                message:
                    "Birthday email processing failed.",

                data: result
            });
        }


        return res.status(200).json({

            status: "success",

            message:
                "Birthday email processing completed successfully.",

            data: result
        });


    } catch (error) {

        console.error(
            "Process birthday mail controller error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message:
                "Failed to process birthday emails."
        });
    }
};


// ==========================================================
// GET BIRTHDAY MAIL LOGS
// ==========================================================

export const getBirthdayMailLogsController = async (
    req,
    res
) => {

    try {

        const logs = await getBirthdayMailLogs();


        return res.status(200).json({

            status: "success",
            message: "Birthday mail logs fetched successfully.",
            data: logs
        });


    } catch (error) {

        console.error(
            "Get birthday mail logs controller error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message:
                "Failed to fetch birthday mail logs."
        });
    }
};


// ==========================================================
// GET BIRTHDAY MAIL LOG BY ID
// ==========================================================

export const getBirthdayMailLogController = async (
    req,
    res
) => {

    try {

        const { id } = req.params;


        if (
            !id ||
            !/^\d+$/.test(id)
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Birthday mail log ID must be a valid number."
            });
        }


        const log =
            await getBirthdayMailLogById(
                Number(id)
            );


        if (!log) {

            return res.status(404).json({

                status: "error",

                message:
                    "Birthday mail log not found."
            });
        }


        return res.status(200).json({

            status: "success",

            message:
                "Birthday mail log fetched successfully.",

            data: log
        });


    } catch (error) {

        console.error(
            "Get birthday mail log controller error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message:
                "Failed to fetch birthday mail log."
        });
    }
};