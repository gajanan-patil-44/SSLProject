import { getAllUserDetails,editUserdetails } from "../../Models/userEditDetails/UserEdit.js";

import {getAllGenders, getAllMaritalStatuses, getAllDesignations, getAllCompanies, getAllReportingManagers, getAllCompanyProducts, getAllProjects, getAllRoles, toggleUserStatuses} from "../../Models/userEditDetails/UserEdit.js";



export const getAllUserDetailsController = async (req, res) => {
    const { flagId } = req.body
    try {
        if (Number(flagId) !== 1) {
            return res.status(400).json({ status: false, message: "Please Enter Valid FlagId" })
        }
        const result = await getAllUserDetails();
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

            // ================================
            // DATA.User
            // ================================
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

            // ================================
            // DATA.UserCompany
            // ================================
            companies,

            // ================================
            // DATA.UserProduct
            // ================================
            products,

            // ================================
            // DATA.UserProject
            // ================================
            projects,

            // ================================
            // DATA.UserRole
            // ================================
            roles,

            // ================================
            // DATA.UserReportingManager
            // ================================
            reportingManagers

        } = req.body;


        // ============================================================
        // 1. VALIDATE FLAG
        // ============================================================

        if (Number(flagId) !== 2) {

            return res.status(400).json({
                success: false,
                message: "Please enter Valid FlagId"
            });
        }


        // ============================================================
        // 2. VALIDATE USER ID
        // ============================================================

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


        // ============================================================
        // 3. HELPER
        // ============================================================

        const isProvided = (value) => {

            return (
                value !== undefined &&
                value !== null &&
                value !== ""
            );
        };


        // ============================================================
        // 4. VALIDATE ARRAYS
        // ============================================================

        if (
            companies !== undefined &&
            !Array.isArray(companies)
        ) {

            return res.status(400).json({
                success: false,
                message: "companies must be an array."
            });
        }


        if (
            products !== undefined &&
            !Array.isArray(products)
        ) {

            return res.status(400).json({
                success: false,
                message: "products must be an array."
            });
        }


        if (
            projects !== undefined &&
            !Array.isArray(projects)
        ) {

            return res.status(400).json({
                success: false,
                message: "projects must be an array."
            });
        }


        if (
            roles !== undefined &&
            !Array.isArray(roles)
        ) {

            return res.status(400).json({
                success: false,
                message: "roles must be an array."
            });
        }


        if (
            reportingManagers !== undefined &&
            !Array.isArray(reportingManagers)
        ) {

            return res.status(400).json({
                success: false,
                message: "reportingManagers must be an array."
            });
        }


        // ============================================================
        // 5. CHECK AT LEAST ONE USER FIELD
        // ============================================================

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
            dateOfJoining

        ].some(isProvided);


        // ============================================================
        // 6. CHECK RELATIONSHIP EDITS
        // ============================================================

        const hasCompanyEdit =
            Array.isArray(companies) &&
            companies.length > 0;


        const hasProductEdit =
            Array.isArray(products) &&
            products.length > 0;


        const hasProjectEdit =
            Array.isArray(projects) &&
            projects.length > 0;


        const hasRoleEdit =
            Array.isArray(roles) &&
            roles.length > 0;


        const hasReportingManagerEdit =
            Array.isArray(reportingManagers) &&
            reportingManagers.length > 0;


        // ============================================================
        // 7. AT LEAST ONE FIELD MUST BE SENT
        // ============================================================

        if (
            !hasUserField &&
            !hasCompanyEdit &&
            !hasProductEdit &&
            !hasProjectEdit &&
            !hasRoleEdit &&
            !hasReportingManagerEdit
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "At least one field is required to update the user."
            });
        }


        // ============================================================
        // 8. VALIDATE COMPANIES
        // ============================================================

        if (Array.isArray(companies)) {

            for (const company of companies) {

                if (!isProvided(company.UserCompanyId)) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "UserCompanyId is required for every company."
                    });
                }

                if (
                    !isProvided(company.companyId) &&
                    !isProvided(company.isPrimaryCompany)
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "At least one company field is required."
                    });
                }
            }
        }


        // ============================================================
        // 9. VALIDATE PRODUCTS
        // ============================================================

        if (Array.isArray(products)) {

            for (const product of products) {

                if (!isProvided(product.UserProductId)) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "UserProductId is required for every product."
                    });
                }

                if (!isProvided(product.companyProductId)) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "companyProductId is required for every product."
                    });
                }
            }
        }


        // ============================================================
        // 10. VALIDATE PROJECTS
        // ============================================================

        if (Array.isArray(projects)) {

            for (const project of projects) {

                if (!isProvided(project.UserProjectId)) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "UserProjectId is required for every project."
                    });
                }

                if (
                    !isProvided(project.projectId) &&
                    !isProvided(project.isPrimary)
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "At least one project field is required."
                    });
                }
            }
        }


        // ============================================================
        // 11. VALIDATE ROLES
        // ============================================================

        if (Array.isArray(roles)) {

            for (const role of roles) {

                if (!isProvided(role.UserRoleId)) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "UserRoleId is required for every role."
                    });
                }

                if (
                    !isProvided(role.roleId) &&
                    !isProvided(role.roleCompanyId) &&
                    !isProvided(role.roleCompanyProductId) &&
                    !isProvided(role.roleProjectId)
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "At least one role field is required."
                    });
                }
            }
        }


        // ============================================================
        // 12. VALIDATE REPORTING MANAGERS
        // ============================================================

        if (Array.isArray(reportingManagers)) {

            for (const manager of reportingManagers) {

                if (
                    !isProvided(
                        manager.UserReportingManagerId
                    )
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "UserReportingManagerId is required for every reporting manager."
                    });
                }

                if (
                    !isProvided(
                        manager.reportingManagerUserId
                    ) &&
                    !isProvided(
                        manager.reportingManagerCompanyId
                    )
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "At least one reporting manager field is required."
                    });
                }
            }
        }


        // ============================================================
        // 13. CALL MODEL
        // ============================================================

        const result = await editUserdetails({

            UserId,

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

            companies,
            products,
            projects,
            roles,
            reportingManagers
        });


        // ============================================================
        // 14. NO ACTUAL CHANGE
        // ============================================================

        if (result.message === "No changes detected") {

            return res.status(200).json({
                success: true,
                message: "No changes detected.",
                data: result
            });
        }


        // ============================================================
        // 15. SUCCESS
        // ============================================================

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

        return res.status(500).json({
            success: false,
            message: "Failed to update user details.",
            error: error.message,
            stack:error.stack
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