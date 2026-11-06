import { getAllUserDetails, editUserdetails } from "../../Models/userEditDetails/UserEdit.js";

import { getAllGenders, getAllMaritalStatuses, getAllDesignations, getAllCompanies, getAllReportingManagers, getAllCompanyProducts, getAllProjects, getAllRoles, toggleUserStatuses, changeUserPassword } from "../../Models/userEditDetails/UserEdit.js";

import bcrypt from "bcrypt";

export const getAllUserDetailsController = async (req, res) => {
    const { flagId ,CompanyId} = req.body
    try {
        if(Number(CompanyId) <= 0 || !Number.isInteger(Number(CompanyId))|| CompanyId === undefined || CompanyId === null || CompanyId === ""){
            return res.status(400).json({ status: false, 
                message: "Please Enter Valid CompanyId" })
        }
        if (Number(flagId) !== 1) {
            return res.status(400).json({ status: false, message: "Please Enter Valid FlagId" })
        }
        const result = await getAllUserDetails(CompanyId);
        return res.status(200).json({
            status: true,
            message: "UserDetails Fetched Successfully",
            data: result
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}


// export const editUserdetailsController = async (req, res) => {

//     const {
//         UserId,
//         flagId,

//         // =========================
//         // USER DETAILS
//         // =========================
//         employeeId,
//         firstName,
//         middleName,
//         lastName,
//         phoneNumber,
//         dateOfBirth,
//         genderId,
//         maritalStatusId,
//         designationId,
//         email,
//         loginName,
//         altPhoneNumber,
//         dateOfJoining,
//         updatedByUserName,

//         // =========================
//         // USER COMPANY
//         // =========================
//         UserCompanyId,
//         companyId,
//         isPrimaryCompany,

//         // =========================
//         // USER PRODUCT
//         // =========================
//         UserProductId,
//         companyProductId,

//         // =========================
//         // USER PROJECT
//         // =========================
//         UserProjectId,
//         projectId,
//         isPrimary,

//         // =========================
//         // USER ROLE
//         // =========================
//         UserRoleId,
//         roleId,
//         roleCompanyId,
//         roleCompanyProductId,
//         roleProjectId,

//         // =========================
//         // REPORTING MANAGER
//         // =========================
//         UserReportingManagerId,
//         reportingManagerUserId,
//         reportingManagerCompanyId

//     } = req.body;


//     try {

//         // =========================
//         // FLAG VALIDATION
//         // =========================

//         if (Number(flagId) !== 2) {

//             return res.status(400).json({
//                 status: false,
//                 message: "Please Enter Valid FlagId"
//             });

//         }


//         // =========================
//         // USER ID VALIDATION
//         // =========================

//         if (!UserId) {

//             return res.status(400).json({
//                 status: false,
//                 message: "UserId is required"
//             });

//         }


//         // =========================
//         // CALL SERVICE
//         // =========================

//         const result = await editUserdetails({

//             // USER
//             UserId,
//             employeeId,
//             firstName,
//             middleName,
//             lastName,
//             phoneNumber,
//             dateOfBirth,
//             genderId,
//             maritalStatusId,
//             designationId,
//             email,
//             loginName,
//             altPhoneNumber,
//             dateOfJoining,
//             updatedByUserName,

//             // USER COMPANY
//             UserCompanyId,
//             companyId,
//             isPrimaryCompany,

//             // USER PRODUCT
//             UserProductId,
//             companyProductId,

//             // USER PROJECT
//             UserProjectId,
//             projectId,
//             isPrimary,

//             // USER ROLE
//             UserRoleId,
//             roleId,
//             roleCompanyId,
//             roleCompanyProductId,
//             roleProjectId,

//             // REPORTING MANAGER
//             UserReportingManagerId,
//             reportingManagerUserId,
//             reportingManagerCompanyId

//         });


//         // =========================
//         // USER NOT FOUND
//         // =========================

//         if (!result) {

//             return res.status(404).json({
//                 status: false,
//                 message: "User not found"
//             });

//         }


//         // =========================
//         // SUCCESS
//         // =========================

//         return res.status(200).json({
//             status: true,
//             message: "User Details Updated Successfully",
//             data: result
//         });


//     } catch (error) {

//         console.error("Edit User Details Error:", error);

//         return res.status(500).json({
//             status: false,
//             message: "Internal Server Error",
//             error: error.message
//         });

//     }
// };


// export const editUserdetailsController = async (req, res) => {
//     try {

//         // =====================================================
//         // 1. Get request body
//         // =====================================================

//         const {
//             flagId,
//             UserId,

//             employeeId,
//             firstName,
//             middleName,
//             lastName,
//             phoneNumber,
//             dateOfBirth,
//             genderId,
//             maritalStatusId,
//             designationId,
//             email,
//             loginName,
//             altPhoneNumber,
//             dateOfJoining,
//             updatedByUserName,

//             UserCompanyId,
//             companyId,
//             isPrimaryCompany,

//             UserProductId,
//             companyProductId,

//             UserProjectId,
//             projectId,
//             isPrimary,

//             UserRoleId,
//             roleId,
//             roleCompanyId,
//             roleCompanyProductId,
//             roleProjectId,

//             UserReportingManagerId,
//             reportingManagerUserId,
//             reportingManagerCompanyId
//         } = req.body;


//         // =====================================================
//         // 2. Validate flagId
//         // =====================================================

//         if (Number(flagId) !== 2) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please enter Valid FlagId"
//             });
//         }


//         // =====================================================
//         // 3. Validate UserId
//         // =====================================================

//         if (
//             UserId === undefined ||
//             UserId === null ||
//             UserId === ""
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message: "UserId is required."
//             });
//         }


//         // =====================================================
//         // 4. Check whether at least ONE editable field
//         //    was actually sent in request
//         // =====================================================

//         const editableFields = [

//             // User fields
//             employeeId,
//             firstName,
//             middleName,
//             lastName,
//             phoneNumber,
//             dateOfBirth,
//             genderId,
//             maritalStatusId,
//             designationId,
//             email,
//             loginName,
//             altPhoneNumber,
//             dateOfJoining,
//             updatedByUserName,

//             // UserCompany
//             UserCompanyId,
//             companyId,
//             isPrimaryCompany,

//             // UserProduct
//             UserProductId,
//             companyProductId,

//             // UserProject
//             UserProjectId,
//             projectId,
//             isPrimary,

//             // UserRole
//             UserRoleId,
//             roleId,
//             roleCompanyId,
//             roleCompanyProductId,
//             roleProjectId,

//             // Reporting Manager
//             UserReportingManagerId,
//             reportingManagerUserId,
//             reportingManagerCompanyId
//         ];


//         const hasAtLeastOneField = editableFields.some(
//             (value) =>
//                 value !== undefined &&
//                 value !== null &&
//                 value !== ""
//         );


//         // =====================================================
//         // 5. If no field was supplied
//         //    DO NOT call model
//         //    DO NOT fetch DB
//         //    DO NOT insert UserDetails
//         // =====================================================

//         if (!hasAtLeastOneField) {
//             return res.status(400).json({
//                 success: false,
//                 message: "At least one field is required to update the user."
//             });
//         }


//         // =====================================================
//         // 6. Call model
//         // =====================================================

//         const result = await editUserdetails({

//             UserId,

//             employeeId,
//             firstName,
//             middleName,
//             lastName,
//             phoneNumber,
//             dateOfBirth,
//             genderId,
//             maritalStatusId,
//             designationId,
//             email,
//             loginName,
//             altPhoneNumber,
//             dateOfJoining,
//             updatedByUserName,

//             UserCompanyId,
//             companyId,
//             isPrimaryCompany,

//             UserProductId,
//             companyProductId,

//             UserProjectId,
//             projectId,
//             isPrimary,

//             UserRoleId,
//             roleId,
//             roleCompanyId,
//             roleCompanyProductId,
//             roleProjectId,

//             UserReportingManagerId,
//             reportingManagerUserId,
//             reportingManagerCompanyId
//         });


//         // =====================================================
//         // 7. No actual DB value changed
//         // =====================================================

//         if (result.message === "No changes detected") {
//             return res.status(200).json({
//                 success: true,
//                 message: "No changes detected.",
//                 data: result
//             });
//         }


//         // =====================================================
//         // 8. Successful update
//         // =====================================================

//         return res.status(200).json({
//             success: true,
//             message: "User details updated successfully.",
//             data: result
//         });


//     } catch (error) {

//         return res.status(500).json({
//             success: false,
//             message: "Failed to update user details.",
//             error: error.message
//         });
//     }
// };







// ======================================================
// GET GENDER
// ======================================================




export const editUserdetailsController = async (req, res) => {

    try {

        const {
            flagId,
            UserId,

            // =====================================
            // DATA.User
            // =====================================
            employeeId,
            firstName,
            middleName,
            lastName,
            phoneNumber,
            dateOfBirth,
            genderId,
            maritalStatusId,
            designationId,
            email,
            loginName,
            altPhoneNumber,
            dateOfJoining,
            updatedByUserName,

            // =====================================
            // NORMAL FIELDS - NOT ARRAYS
            // =====================================
            CompanyId,
            RoleId,
            companyId,
            roleId,

            // =====================================
            // ARRAY FIELDS
            // =====================================
            CompanyProductId,
            ProjectId,
            ReportingManagerUserId,

            // Backward-compatible field names
            companyProducts,
            projects,
            reportingManagers

        } = req.body;


        // =============================================
        // 1. VALIDATE FLAG
        // =============================================

        if (Number(flagId) !== 2) {

            return res.status(400).json({
                success: false,
                message: "Please enter Valid FlagId"
            });

        }


        // =============================================
        // 2. VALIDATE USER ID
        // =============================================

        if (
            UserId === undefined ||
            UserId === null ||
            UserId === "" ||
            !Number.isInteger(Number(UserId)) ||
            Number(UserId) <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Valid UserId is required."
            });

        }


        // =============================================
        // 3. HELPER FUNCTIONS
        // =============================================

        const isProvided = (value) => {

            return (
                value !== undefined &&
                value !== null &&
                value !== ""
            );

        };


        // =============================================
        // 4. PARSE ARRAY
        // Supports JSON and FORM-DATA
        // =============================================

        const parseArray = (value, fieldName) => {

            if (value === undefined || value === null) {
                return undefined;
            }

            let parsedValue = value;

            // JSON request: already an array
            if (Array.isArray(value)) {

                parsedValue = value;

            }

            // Form-data request: JSON string
            else if (typeof value === "string") {

                if (value.trim() === "") {
                    return undefined;
                }

                try {

                    parsedValue = JSON.parse(value);

                } catch (error) {

                    throw new Error(
                        `${fieldName} must be a valid JSON array.`
                    );

                }

            }

            else {

                throw new Error(
                    `${fieldName} must be an array.`
                );

            }


            if (!Array.isArray(parsedValue)) {

                throw new Error(
                    `${fieldName} must be an array.`
                );

            }


            // Validate individual IDs
            for (const id of parsedValue) {

                if (
                    id === null ||
                    id === undefined ||
                    id === "" ||
                    !Number.isInteger(Number(id)) ||
                    Number(id) <= 0
                ) {

                    throw new Error(
                        `${fieldName} must contain valid positive IDs.`
                    );

                }

            }

            return parsedValue.map(Number);

        };


        // =============================================
        // 5. PARSE ONLY THREE ARRAYS
        // =============================================

        const reportingManagerArray = parseArray(
            ReportingManagerUserId ?? reportingManagers,
            "ReportingManagerUserId"
        );


        const companyProductArray = parseArray(
            CompanyProductId ?? companyProducts,
            "CompanyProductId"
        );


        const projectArray = parseArray(
            ProjectId ?? projects,
            "ProjectId"
        );


        // =============================================
        // 6. NORMAL FIELD VALUES
        // =============================================

        const finalCompanyId = CompanyId ?? companyId;

        const finalRoleId = RoleId ?? roleId;


        // =============================================
        // 7. CHECK AT LEAST ONE USER FIELD
        // =============================================

        const hasUserField = [

            employeeId,
            firstName,
            middleName,
            lastName,
            phoneNumber,
            dateOfBirth,
            genderId,
            maritalStatusId,
            designationId,
            email,
            loginName,
            altPhoneNumber,
            dateOfJoining,
            updatedByUserName,
            finalCompanyId,
            finalRoleId

        ].some(isProvided);


        // =============================================
        // 8. CHECK ARRAY EDITS
        // =============================================

        const hasReportingManagerEdit =
            reportingManagerArray !== undefined;

        const hasCompanyProductEdit =
            companyProductArray !== undefined;

        const hasProjectEdit =
            projectArray !== undefined;


        // =============================================
        // 9. AT LEAST ONE FIELD REQUIRED
        // =============================================

        if (
            !hasUserField &&
            !hasReportingManagerEdit &&
            !hasCompanyProductEdit &&
            !hasProjectEdit
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "At least one field is required to update the user."
            });

        }


        // =============================================
        // 10. CALL MODEL
        // =============================================

        const result = await editUserdetails({

            UserId: Number(UserId),

            // DATA.User
            employeeId,
            firstName,
            middleName,
            lastName,
            phoneNumber,
            dateOfBirth,
            genderId,
            maritalStatusId,
            designationId,
            email,
            loginName,
            altPhoneNumber,
            dateOfJoining,
            updatedByUserName,

            // Normal fields
            companyId: finalCompanyId,
            roleId: finalRoleId,

            // Only three ID arrays
            reportingManagers: reportingManagerArray,
            products: companyProductArray,
            projects: projectArray

        });


        // =============================================
        // 11. NO CHANGES
        // =============================================

        if (result.message === "No changes detected") {

            return res.status(200).json({
                success: true,
                message: "No changes detected.",
                data: result
            });

        }


        // =============================================
        // 12. SUCCESS
        // =============================================

        return res.status(200).json({
            success: true,
            message: "User details updated successfully.",
            data: result
        });


    } catch (error) {

        console.error(
            "editUserdetailsController error:",
            error
        );

        const isValidationError =
            error.message.includes("must be") ||
            error.message.includes("valid positive IDs");

        return res.status(isValidationError ? 400 : 500).json({
            success: false,
            message: isValidationError
                ? error.message
                : "Failed to update user details.",
            error: error.message
        });

    }

};


export const getGender = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        if (parseInt(flagId) == 1) {

            const rows = await getAllGenders();

            return res.status(200).json({
                status: "success",
                message: "Genders fetched successfully",
                data: rows
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            });
        }

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch genders",
            error: error.message
        });
    }
};



// ======================================================
// GET MARITAL STATUS
// ======================================================

export const getMaritalStatus = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        if (parseInt(flagId) == 1) {

            const rows = await getAllMaritalStatuses();

            return res.status(200).json({
                status: "success",
                message: "Marital statuses fetched successfully",
                data: rows
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            });
        }

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch marital statuses",
            error: error.message
        });
    }
};


// ======================================================
// GET DESIGNATION
// ======================================================

export const getDesignation = async (req, res) => {

    const { flagId, CompanyId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        if (parseInt(flagId) == 1) {

            if (!CompanyId) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }

            if (!Number.isInteger(Number(CompanyId)) || Number(CompanyId) <= 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid CompanyId"
                });
            }

            const rows = await getAllDesignations(CompanyId);

            return res.status(200).json({
                status: "success",
                message: "Designations fetched successfully",
                data: rows
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            });
        }

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch designations",
            error: error.message
        });
    }
};


// ======================================================
// GET COMPANY
// ======================================================

export const getCompany = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        if (parseInt(flagId) == 1) {

            const rows = await getAllCompanies();

            return res.status(200).json({
                status: "success",
                message: "Companies fetched successfully",
                data: rows
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            });
        }

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch companies",
            error: error.message
        });
    }
};


// ======================================================
// GET REPORTING MANAGER
// ======================================================

export const getReportingManager = async (req, res) => {

    const { flagId, CompanyId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        if (parseInt(flagId) == 1) {

            if (!CompanyId) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }

            if (!Number.isInteger(Number(CompanyId)) || Number(CompanyId) <= 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid CompanyId"
                });
            }

            const rows = await getAllReportingManagers(CompanyId);

            return res.status(200).json({
                status: "success",
                message: "Reporting managers fetched successfully",
                data: rows
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            });
        }

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch reporting managers",
            error: error.message
        });
    }
};


// ======================================================
// GET COMPANY PRODUCT
// ======================================================

export const getCompanyProduct = async (req, res) => {

    const { flagId, CompanyId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        if (parseInt(flagId) == 1) {

            if (!CompanyId) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }

            if (!Number.isInteger(Number(CompanyId)) || Number(CompanyId) <= 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid CompanyId"
                });
            }

            const rows = await getAllCompanyProducts(CompanyId);

            return res.status(200).json({
                status: "success",
                message: "Company products fetched successfully",
                data: rows
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            });
        }

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch company products",
            error: error.message
        });
    }
};


// ======================================================
// GET PROJECT
// ======================================================

export const getProject = async (req, res) => {

    const { flagId, CompanyProductId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        if (parseInt(flagId) == 1) {

            if (!CompanyProductId) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyProductId is required"
                });
            }

            if (
                !Number.isInteger(Number(CompanyProductId)) ||
                Number(CompanyProductId) <= 0
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid CompanyProductId"
                });
            }

            const rows = await getAllProjects(CompanyProductId);

            return res.status(200).json({
                status: "success",
                message: "Projects fetched successfully",
                data: rows
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            });
        }

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch projects",
            error: error.message
        });
    }
};


// ======================================================
// GET ROLE
// ======================================================

export const getRole = async (req, res) => {

    const { flagId, CompanyId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        if (parseInt(flagId) == 1) {

            if (!CompanyId) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }

            if (!Number.isInteger(Number(CompanyId)) || Number(CompanyId) <= 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid CompanyId"
                });
            }

            const rows = await getAllRoles(CompanyId);

            return res.status(200).json({
                status: "success",
                message: "Roles fetched successfully",
                data: rows
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            });
        }

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch roles",
            error: error.message
        });
    }
};


export const toggleUserStatus = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        // flagId 4 = Toggle User Status
        if (parseInt(flagId) === 1) {

            const userData = req.body;
            const user = await toggleUserStatuses(userData);

            // User does not exist
            if (!user) {

                return res.status(404).json({
                    status: "error",
                    message: "User not found"
                });
            }

            // User status successfully toggled
            return res.status(200).json({
                status: "success",
                message: "User status updated successfully"
            });
        }

        // Invalid flagId
        return res.status(400).json({
            status: "error",
            message: "Invalid flagId"
        });

    } catch (error) {

        // console.error("Error toggling user status:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to update user status",
            error: error.message
        });
    }
};



export const changePasswordController = async (req, res) => {
    try {
        const { FlagId, UserId, NewPassword } = req.body;

        // ==========================================
        // VALIDATE FLAG ID
        // ==========================================

        if (
            FlagId === undefined ||
            FlagId === null ||
            String(FlagId).trim() === ""
        ) {
            return res.status(400).json({
                status: "error",
                message: "FlagId is required"
            });
        }

        // ==========================================
        // FLAG ID 1 - CHANGE PASSWORD
        // ==========================================

        if (parseInt(FlagId) === 1) {
            // Validate UserId
            if (
                UserId === undefined ||
                UserId === null ||
                String(UserId).trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "UserId is required"
                });
            }

            const userId = Number(UserId);

            if (!Number.isInteger(userId) || userId <= 0) {
                return res.status(400).json({
                    status: "error",
                    message: "UserId must be a valid positive integer"
                });
            }

            // Validate NewPassword
            if (
                typeof NewPassword !== "string" ||
                NewPassword.trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "NewPassword is required"
                });
            }

            if (NewPassword.length < 8 || NewPassword.length > 72) {
                return res.status(400).json({
                    status: "error",
                    message: "NewPassword must contain 8 to 72 characters"
                });
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(NewPassword, 10);

            // Change password
            const result = await changeUserPassword({
                UserId: userId,
                NewPassword,
                HashedPassword: hashedPassword,
                UpdatedByUserId: userId
            });

            if (!result.success) {
                return res.status(result.status).json({
                    status: "error",
                    message: result.message
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Password changed successfully"
            });
        }

        // ==========================================
        // INVALID FLAG ID
        // ==========================================

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId. Use FlagId 1 to change password"
        });

    } catch (error) {
        console.error("Change Password Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to change password"
        });
    }
};
