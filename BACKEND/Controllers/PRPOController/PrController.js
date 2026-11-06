import fs from "fs/promises";

import { createPRPOModel, getMaterialDrpDwnModel, getPriorityLevelDrpDwnModel,updateActionPRPOStatusModel } from "../../Models/PRModel/PrModel.js";

import { processPRPOFiles } from "../../Helpers/PrcoessPRPOfiles.js";

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
    let filesToCleanup = [];
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

        filesToCleanup = [...uploadedFiles];

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
        // 11. PROCESS UPLOADED FILES
        // ==========================================

        const {
            processedFiles,
            processedFileTypeIds
        } = await processPRPOFiles(
            uploadedFiles,
            parsedFileTypeIds
        );

        // Include generated PDFs in cleanup if database insertion fails
        filesToCleanup = [
            ...uploadedFiles,
            ...processedFiles
        ];

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

            files: processedFiles,

            fileTypeIds: processedFileTypeIds

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

        await removeUploadedFiles(filesToCleanup);



        return res.status(500).json({

            status: false,

            message: "Internal Server Error",

            error: error.message,

            stack: error.stack

        });

    }

};


export const getMaterialDrpDwnController = async (req, res) => {

    try {

        const { selectedMaterialIds = [], flagId } = req.body;
        if (Number(flagId) !== 2) {
            return res.status(400).json({
                status: false,
                message: "Please enter the valid flagId."
            });jhg
        }

        if (!Array.isArray(selectedMaterialIds)) {
            return res.status(400).json({
                status: false,
                message: "selectedMaterialIds must be an array."
            });
        }

        const result = await getMaterialDrpDwnModel(selectedMaterialIds);

        return res.status(200).json({
            status: true,
            message: "Material dropdown fetched successfully.",
            data: result
        });

    } catch (error) {

        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error.message
        });

    }
};

export const getPriorityLevelDrpDwnController = async (req, res) => {
    const { flagId } = req.body;
    try {
        if (Number(flagId) !== 1) {
            return res.status(400).json({
                status: false,
                message: "Please enter the valid flagId."
            });
        }
        const result = await getPriorityLevelDrpDwnModel();

        return res.status(200).json({
            status: true,
            message: "Priority Level dropdown fetched successfully.",
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

export const updatePRPOActionController = async (req, res) => {
    try {
        const {
            PRPOHeaderId,
            PRPOStatusId,
            UserId,
            ActionForUserId,
            Comments
        } = req.body;


        // ==========================================
        // 1. REQUIRED FIELD VALIDATION
        // ==========================================

        if (
            !PRPOHeaderId ||
            !PRPOStatusId ||
            !UserId
        ) {

            return res.status(400).json({
                status: false,
                message: "PRPOHeaderId, PRPOStatusId and UserId are required."
            });
        }


        // ==========================================
        // 2. VALIDATE NUMERIC VALUES
        // ==========================================

        const headerId = Number(PRPOHeaderId);
        const statusId = Number(PRPOStatusId);
        const userId = Number(UserId);

        if (
            !Number.isInteger(headerId) ||
            headerId <= 0 ||
            !Number.isInteger(userId) ||
            userId <= 0 ||
            !Number.isInteger(statusId)
        ) {

            return res.status(400).json({
                status: false,
                message: "Invalid PRPOHeaderId, UserId or PRPOStatusId."
            });
        }


        // ==========================================
        // 3. VALIDATE STATUS
        // ==========================================

        if (![3, 4, 5].includes(statusId)) {

            return res.status(400).json({
                status: false,
                message: "Allowed PRPOStatusId values are 3, 4 and 5."
            });
        }


        // ==========================================
        // 4. VALIDATE FORWARD USER
        // ==========================================

        let nextApproverId = null;

        if (statusId === 3) {

            nextApproverId = Number(ActionForUserId);

            if (
                !Number.isInteger(nextApproverId) ||
                nextApproverId <= 0 ||
                nextApproverId === userId
            ) {

                return res.status(400).json({
                    status: false,
                    message: "A valid next approver UserId is required."
                });
            }
        }


        // ==========================================
        // 5. CALL MODEL
        // ==========================================

        const result = await updateActionPRPOStatusModel({

            PRPOHeaderId: headerId,

            PRPOStatusId: statusId,

            ActionByUserId: userId,

            ActionForUserId: nextApproverId,

            Comments: Comments || null

        });


        // ==========================================
        // 6. SUCCESS RESPONSE
        // ==========================================

        return res.status(200).json({

            status: true,

            message: result.message,

            data: result.data

        });


    } catch (error) {

        console.error("Update PRPO Status Error:", error);

        return res.status(error.statusCode || 500).json({

            status: false,

            message: error.message || "Internal Server Error."

        });

    }

};

