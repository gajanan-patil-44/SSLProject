import {
    getMailStatusIds,
    getTodaysBirthdayUsers,
    createBirthdayMailLog,
    updateBirthdayMailLogBeforeSending,
    updateBirthdayMailLogSuccess,
    updateBirthdayMailLogFailed
} from "../Models/BirthdayModels.js";

import transporter from "../Config/email.js";


// VALIDATE EMAIL

const isValidEmail = (email) => {

    if (!email) {
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email.trim());
};


// GET FULL EMPLOYEE NAME

const getEmployeeName = (employee) => {

    return [
        employee.FirstName,
        employee.MiddleName,
        employee.LastName
    ]
        .filter(
            value =>
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
        )
        .map(value => String(value).trim())
        .join(" ");
};


// CREATE EMAIL CONTENT

const createBirthdayMailContent = (employee) => {

    const employeeName = getEmployeeName(employee) || "Employee";

    const yearsServedText =
        employee.YearsServed !== null &&
        employee.YearsServed !== undefined
            ? `You have completed ${employee.YearsServed} years of service with us.`
            : "Thank you for being a valuable member of our organization.";


    const subject =
        `Happy Birthday, ${employeeName}! 🎂`;


    const text = `
Happy Birthday, ${employeeName}!

Wishing you a very Happy Birthday!

Thank you for being a valuable member of our organization.

${yearsServedText}

We wish you continued success, happiness and many more wonderful years ahead.

Regards,
Team Vishvin
    `.trim();


    const html = `
<!DOCTYPE html>

<html>

<head>
    <meta charset="UTF-8">
    <title>Happy Birthday</title>
</head>

<body
    style="
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
        font-family: Arial, Helvetica, sans-serif;
    "
>

    <div
        style="
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
        "
    >

        <h1>
            🎂 Happy Birthday, ${employeeName}!
        </h1>

        <p>
            Wishing you a very
            <strong>Happy Birthday!</strong>
        </p>

       
        <p>
            ${yearsServedText}
        </p>

        <p>
            We wish you continued success,
            happiness and many more
            wonderful years ahead.
        </p>

        <br>

        <p>
            Regards,<br>
            <strong>Team Vishvin</strong>
        </p>

    </div>

</body>

</html>
    `.trim();


    return {
        employeeName,
        subject,
        text,
        html
    };
};


// PROCESS BIRTHDAY EMAILS

export const processBirthdayEmails = async () => {

    console.log("----------------------------------------");
    console.log("Birthday email processing started.");
    console.log("----------------------------------------");


    try {

        // GET MAIL STATUS MASTER DATA

        const mailStatuses = await getMailStatusIds();

        const statusMap = {};


        for (const status of mailStatuses) {

            statusMap[status.StatusCode] = status.MailStatusId;
        }


        const pendingStatusId = statusMap.PENDING;

        const sentStatusId = statusMap.SENT;

        const failedStatusId = statusMap.FAILED;

        const retryStatusId = statusMap.RETRY;


        if (
            !pendingStatusId ||
            !sentStatusId ||
            !failedStatusId ||
            !retryStatusId
        ) {

            throw new Error("Required MailStatus values PENDING, SENT, FAILED and RETRY are not configured.");
        }


        // GET TODAY'S BIRTHDAY USERS

        const employees = await getTodaysBirthdayUsers();


        if (employees.length === 0) {

            console.log("No employee birthdays found for today.");


            return {
                success: true,
                totalFound: 0,
                emailsSent: 0,
                emailsFailed: 0,
                emailsSkipped: 0
            };
        }


        console.log(`${employees.length} birthday employee(s) found.`);


        let emailsSent = 0;
        let emailsFailed = 0;
        let emailsSkipped = 0;


        // PROCESS EACH EMPLOYEE

        for (const employee of employees) {

            let birthdayMailLogId = employee.BirthdayMailLogId;


            try {

                const employeeName = getEmployeeName(employee) || "Employee";


                // VALIDATE EMAIL

                if (
                    !employee.Email ||
                    !isValidEmail(employee.Email)
                ) {

                    console.log(`Invalid or missing email for ${employeeName}.`);

                    emailsFailed++;

                    continue;
                }


                const recipientEmail = employee.Email.trim();


                // CREATE EMAIL

                const mailContent = createBirthdayMailContent(employee);


                // IF ALREADY SENT TODAY, SKIP

                if (employee.MailStatusId === sentStatusId) {

                    console.log(`Birthday email already sent to ${recipientEmail} today.`);

                    emailsSkipped++;

                    continue;
                }


                // CREATE OR UPDATE LOG

                if (!birthdayMailLogId) {

                    const log =await createBirthdayMailLog({

                            UserId: employee.UserId,
                            BirthdayDate: new Date(),
                            MailStatusId: pendingStatusId,
                            RecipientEmail: recipientEmail,
                            Subject: mailContent.subject,
                            ErrorMessage: null
                        });


                    birthdayMailLogId = log.BirthdayMailLogId;

                } else {

                    await updateBirthdayMailLogBeforeSending({

                        BirthdayMailLogId: birthdayMailLogId,
                        MailStatusId: retryStatusId,
                        RecipientEmail: recipientEmail,
                        Subject: mailContent.subject
                    });
                }


                // SEND EMAIL

                const mailOptions = {

                    from: process.env.EMAIL_FROM,
                    to: recipientEmail,
                    subject: mailContent.subject,
                    text: mailContent.text,
                    html: mailContent.html
                };


                await transporter.sendMail(mailOptions);


                // UPDATE LOG = SENT

                await updateBirthdayMailLogSuccess({

                    BirthdayMailLogId: birthdayMailLogId,
                    MailStatusId: sentStatusId,
                    RecipientEmail: recipientEmail,
                    Subject: mailContent.subject
                });

                emailsSent++;

                console.log(`Birthday email sent successfully to ${recipientEmail}.`);

            } catch (error) {

                emailsFailed++;

                console.error(`Birthday email failed for UserId ${employee.UserId}:`, error.message);


                // UPDATE LOG = FAILED

                try {

                    if (birthdayMailLogId) {

                        await updateBirthdayMailLogFailed({

                            BirthdayMailLogId: birthdayMailLogId,
                            MailStatusId: failedStatusId,
                            RecipientEmail: employee.Email?.trim() || null,
                            Subject:
                                `Happy Birthday, ${
                                    getEmployeeName(employee) ||
                                    "Employee"
                                }! 🎂`,

                            ErrorMessage:
                                error.message
                        });
                    }

                } catch (logError) {

                    console.error(`Failed to update BirthdayMailLog for UserId ${employee.UserId}:`, logError.message);
                }
            }
        }


        console.log("----------------------------------------");
        console.log(`Birthday processing completed. Sent: ${emailsSent}, Failed: ${emailsFailed}, Skipped: ${emailsSkipped}`);
        console.log("----------------------------------------");


        return {

            success: true,
            totalFound:employees.length,
            emailsSent,
            emailsFailed,
            emailsSkipped
        };


    } catch (error) {

        console.error("Birthday email processing failed:", error);


        return {

            success: false,
            totalFound: 0,
            emailsSent: 0,
            emailsFailed: 0,
            emailsSkipped: 0,
            error: error.message
        };
    }
};