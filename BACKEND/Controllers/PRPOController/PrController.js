import fs from "fs/promises";

import { createPRPOModel } from "../../Models/PRModel/PrModel.js";



// ==========================================
// REMOVE UPLOADED FILES
// ==========================================

const removeUploadedFiles = async (files = []) => {

    await Promise.all(
        files.map(file =>
            fs.unlink(file.path).catch(error => {
                console.error("File deletion error:", error.message);
            })
        )
    );
};


// ==========================================
// CREATE PRPO CONTROLLER
// ==========================================

export const createPRPOController = async (req, res) => {

    try {
        const {
            UserId,
            CompanyId,
            ProjectId,
            DesignationId,
            DepartmentId,
            ReportingToUserId,
            RequestDate,
            RequiredDate,
            PriorityId,
            PurPose,
            materials,
            fileTypeIds,
            flagId

        } = req.body;

        // ==========================================
        // 3. COMMON ERROR RESPONSE
        // ==========================================

        const sendErrorResponse = async (statusCode, message) => {

            await removeUploadedFiles(req.files);

            return res.status(statusCode).json({
                status: false,
                message
            });
        };


        // ==========================================
        // 4. VALIDATE FLAG ID
        // ==========================================

        if (Number(flagId) !== 1) {

            return await sendErrorResponse(
                400,
                "Please enter the valid flagId."
            );
        }


        // ==========================================
        // 5. VALIDATE LOGIN DETAILS
        // ==========================================

        if (
            !UserId ||
            !CompanyId ||
            !ProjectId ||
            !DesignationId ||
            !DepartmentId ||
            !ReportingToUserId
        ) {

            return await sendErrorResponse(
                401,
                "Required logged-in user details are missing."
            );
        }


        // ==========================================
        // 6. VALIDATE REQUIRED FIELDS
        // ==========================================

        if (!RequestDate || !PriorityId || !materials) {

            return await sendErrorResponse(
                400,
                "RequestDate, PriorityId, materials  are required."
            );
        }


        // ==========================================
        // 7. PARSE MATERIALS
        // ==========================================

        let parsedMaterials;

        try {

            parsedMaterials = JSON.parse(materials);

        } catch (error) {

            return await sendErrorResponse(
                400,
                "Invalid materials JSON format."
            );
        }


        if (
            !Array.isArray(parsedMaterials) ||
            parsedMaterials.length === 0
        ) {

            return await sendErrorResponse(
                400,
                "At least one material is required."
            );
        }


        // ==========================================
        // 8. VALIDATE MATERIALS
        // ==========================================

        for (const material of parsedMaterials) {

            if (
                !material.MaterialId ||
                !Number.isInteger(Number(material.MaterialId)) ||
                !Number.isFinite(Number(material.Quantity)) ||
                Number(material.Quantity) <= 0
            ) {

                return await sendErrorResponse(
                    400,
                    "Each material must have a valid MaterialId and Quantity."
                );
            }
        }


        // ==========================================
        // 9. PARSE FILE TYPE IDS
        // ==========================================

        let parsedFileTypeIds = [];

        if (fileTypeIds) {

            try {

                parsedFileTypeIds = JSON.parse(fileTypeIds);

            } catch (error) {

                return await sendErrorResponse(
                    400,
                    "Invalid fileTypeIds JSON format."
                );
            }
        }


        const uploadedFiles = req.files || [];


        // ==========================================
        // 10. VALIDATE FILE TYPE IDS
        // ==========================================

        if (!Array.isArray(parsedFileTypeIds)) {

            return await sendErrorResponse(
                400,
                "fileTypeIds must be an array."
            );
        }


        if (parsedFileTypeIds.length !== uploadedFiles.length) {

            return await sendErrorResponse(
                400,
                "Each uploaded file must have one FileTypeId."
            );
        }


        for (const fileTypeId of parsedFileTypeIds) {

            if (
                !Number.isInteger(Number(fileTypeId)) ||
                Number(fileTypeId) <= 0
            ) {

                return await sendErrorResponse(
                    400,
                    "Invalid FileTypeId."
                );
            }
        }


        // ==========================================
        // 11. PREPARE HEADER DATA
        // ==========================================

        const header = {

            RequestDate,

            RequiredDate: RequiredDate || null,

            PriorityId,

            PurPose: PurPose || null,

            CompanyId,

            ProjectId,

            DesignationId,

            DepartmentId,

            ReportingToUserId,

            CreatedByUserId: UserId

        };


        // ==========================================
        // 12. CALL MODEL
        // ==========================================

        const result = await createPRPOModel({

            header,

            materials: parsedMaterials,

            files: uploadedFiles,

            fileTypeIds: parsedFileTypeIds

        });


        // ==========================================
        // 13. SUCCESS RESPONSE
        // ==========================================

        return res.status(201).json({

            status: true,

            message: "PRPO created and submitted successfully.",

            data: result

        });


    } catch (error) {

        // ==========================================
        // 14. DELETE FILES IF DATABASE INSERT FAILS
        // ==========================================

        await removeUploadedFiles(req.files);



        return res.status(500).json({

            status: false,

            message: "Internal Server Error",

            error: error.message,

            stack: error.stack

        });

    }

};
