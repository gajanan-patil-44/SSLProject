import cron from "node-cron";

import { processBirthdayEmails} from "../Services/birthdayService.js";


// ==========================================================
// START BIRTHDAY JOB
// ==========================================================

const startBirthdayJob = () => {

    const cronExpression =
        process.env.BIRTHDAY_CHECK_CRON ||
        "0 9 * * *";


    const timezone =
        process.env.TIMEZONE ||
        "Asia/Kolkata";


    if (!cron.validate(cronExpression)) {

        throw new Error(
            `Invalid birthday cron expression: ${cronExpression}`
        );
    }


    const task = cron.schedule(
        cronExpression,

        async () => {

            console.log(
                `Birthday cron job triggered at ${new Date().toISOString()}`
            );


            try {

                await processBirthdayEmails();

            } catch (error) {

                console.error(
                    "Birthday cron job failed:",
                    error
                );
            }
        },

        {
            timezone,
            noOverlap: true
        }
    );


    console.log(
        `Birthday job scheduled with: ${cronExpression}`
    );

    console.log(
        `Birthday job timezone: ${timezone}`
    );


    return task;
};


export default startBirthdayJob;