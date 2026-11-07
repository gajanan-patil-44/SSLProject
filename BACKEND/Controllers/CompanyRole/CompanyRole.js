
import {
    getAllCompanyRoles,
    checkRoleExists,
    checkCompanyExists,
    checkCompanyRoleExists,
    addCompanyRole,
    getCompanyRoleById,
    updateCompanyRole,
    updateCompanyRoleStatus,
      getCompanyDropdown,
    getRoleDropdown
} from "../../Models/CompanyRole/CompanyRole.js";


// ======================================================
// COMMON HELPERS
// ======================================================

const getUserCompanyId = (req) => {
    if (req.user?.CompanyId === undefined) {
        return undefined;
    }

    if (
        req.user.CompanyId === null ||
        req.user.CompanyId === ""
    ) {
        return null;
    }

    const companyId = Number(req.user.CompanyId);

    if (!Number.isInteger(companyId) || companyId <= 0) {
        return undefined;
    }

    return companyId;
};


const isValidId = (value) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0;
};


// ======================================================
// FLAG ID 2 - VIEW COMPANY ROLES
// ======================================================

export const getCompanyRoles = async (req, res) => {
    const { FlagId } = req.body;

    try {
        if (parseInt(FlagId) === 1) {

            const CompanyId = getUserCompanyId(req);

            if (CompanyId === undefined) {
                return res.status(403).json({
                    status: "error",
                    message: "Company access information is missing or invalid"
                });
            }

            const roles = await getAllCompanyRoles(CompanyId);

            return res.status(200).json({
                status: "success",
                message: "Company roles fetched successfully",
                data: roles
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {
        console.error("Get Company Roles Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch company roles",
            error: error.message
        });
    }
};


// ======================================================
// FLAG ID 3 - ADD COMPANY ROLE
// ======================================================

export const addCompanyRoleController = async (req, res) => {
    const { FlagId, RoleId, CreatedByUserName } = req.body;

    try {
        if (parseInt(FlagId) === 2) {

            const CompanyIdFromToken = getUserCompanyId(req);

            if (CompanyIdFromToken === undefined) {
                return res.status(403).json({
                    status: "error",
                    message: "Company access information is missing or invalid"
                });
            }

            if (!isValidId(RoleId)) {
                return res.status(400).json({
                    status: "error",
                    message: "Valid RoleId is required"
                });
            }

            // Unrestricted user must provide CompanyId.
            // Company-scoped user always uses CompanyId from token.
            let CompanyId;

            if (CompanyIdFromToken === null) {
                if (!isValidId(req.body.CompanyId)) {
                    return res.status(400).json({
                        status: "error",
                        message: "Valid CompanyId is required"
                    });
                }

                CompanyId = Number(req.body.CompanyId);
            } else {
                CompanyId = CompanyIdFromToken;
            }

            if (
                typeof CreatedByUserName !== "string" ||
                !CreatedByUserName.trim()
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "CreatedByUserName is required"
                });
            }

            // Validate active RoleId directly in the database.
            const role = await checkRoleExists(Number(RoleId));

            if (!role) {
                return res.status(400).json({
                    status: "error",
                    message: "Selected RoleId is invalid or disabled"
                });
            }

            // Validate company directly in the database.
            const company = await checkCompanyExists(CompanyId);

            if (!company) {
                return res.status(400).json({
                    status: "error",
                    message: "Selected CompanyId does not exist"
                });
            }

            // Check duplicate assignment.
            const existing = await checkCompanyRoleExists(
                Number(RoleId),
                CompanyId
            );

            if (existing.length > 0) {
                return res.status(409).json({
                    status: "error",
                    message: "This role is already assigned to the selected company"
                });
            }

            const result = await addCompanyRole({
                RoleId: Number(RoleId),
                CompanyId,
                CreatedByUserName: CreatedByUserName.trim()
            });

            return res.status(201).json({
                status: "success",
                message: "Company role added successfully",
                data: result
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {
        console.error("Add Company Role Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to add company role",
            error: error.message
        });
    }
};


// ======================================================
// FLAG ID 4 - EDIT COMPANY ROLE
// ======================================================

export const editCompanyRoleController = async (req, res) => {
    const {
        FlagId,
        CompanyRoleId,
        RoleId,
        UpdatedByUserName
    } = req.body;

    try {
        if (parseInt(FlagId) === 3) {

            const CompanyIdFromToken = getUserCompanyId(req);

            if (CompanyIdFromToken === undefined) {
                return res.status(403).json({
                    status: "error",
                    message: "Company access information is missing or invalid"
                });
            }

            if (!isValidId(CompanyRoleId)) {
                return res.status(400).json({
                    status: "error",
                    message: "Valid CompanyRoleId is required"
                });
            }

            // At least one editable field must be supplied.
            const hasRoleId = RoleId !== undefined;
            const hasCompanyId = req.body.CompanyId !== undefined;

            if (!hasRoleId && !hasCompanyId) {
                return res.status(400).json({
                    status: "error",
                    message: "Nothing to update. Provide RoleId or CompanyId"
                });
            }

            if (hasRoleId && !isValidId(RoleId)) {
                return res.status(400).json({
                    status: "error",
                    message: "Valid RoleId is required"
                });
            }

            // Check that the record belongs to the logged-in user's company.
            const existingRecord = await getCompanyRoleById(
                Number(CompanyRoleId),
                CompanyIdFromToken
            );

            if (!existingRecord) {
                return res.status(404).json({
                    status: "error",
                    message: "Company role not found or access denied"
                });
            }

            // Keep existing values when optional fields are not supplied.
            const finalRoleId = hasRoleId
                ? Number(RoleId)
                : Number(existingRecord.RoleId);

            let finalCompanyId;

            if (CompanyIdFromToken === null) {
                if (hasCompanyId) {
                    if (!isValidId(req.body.CompanyId)) {
                        return res.status(400).json({
                            status: "error",
                            message: "Valid CompanyId is required"
                        });
                    }

                    finalCompanyId = Number(req.body.CompanyId);
                } else {
                    finalCompanyId = Number(existingRecord.CompanyId);
                }
            } else {
                // Company-scoped users cannot change their company.
                if (
                    hasCompanyId &&
                    Number(req.body.CompanyId) !== CompanyIdFromToken
                ) {
                    return res.status(403).json({
                        status: "error",
                        message: "You cannot change the company assigned to this record"
                    });
                }

                finalCompanyId = CompanyIdFromToken;
            }

            if (!Number.isInteger(finalCompanyId) || finalCompanyId <= 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Valid CompanyId is required"
                });
            }

            // No-op check.
            if (
                finalRoleId === Number(existingRecord.RoleId) &&
                finalCompanyId === Number(existingRecord.CompanyId)
            ) {
                return res.status(200).json({
                    status: "success",
                    message: "No changes found",
                    data: existingRecord
                });
            }

            // Validate RoleId only when it changes.
            if (finalRoleId !== Number(existingRecord.RoleId)) {
                const role = await checkRoleExists(finalRoleId);

                if (!role) {
                    return res.status(400).json({
                        status: "error",
                        message: "Selected RoleId is invalid or disabled"
                    });
                }
            }

            // Validate CompanyId only when it changes.
            if (finalCompanyId !== Number(existingRecord.CompanyId)) {
                const company = await checkCompanyExists(finalCompanyId);

                if (!company) {
                    return res.status(400).json({
                        status: "error",
                        message: "Selected CompanyId does not exist"
                    });
                }
            }

            // Check duplicate mapping, excluding the current record.
            const duplicate = await checkCompanyRoleExists(
                finalRoleId,
                finalCompanyId,
                Number(CompanyRoleId)
            );

            if (duplicate.length > 0) {
                return res.status(409).json({
                    status: "error",
                    message: "This role is already assigned to the selected company"
                });
            }

            const result = await updateCompanyRole({
                CompanyRoleId: Number(CompanyRoleId),
                RoleId: finalRoleId,
                CompanyId: finalCompanyId,
                UpdatedByUserName:
                    typeof UpdatedByUserName === "string" &&
                    UpdatedByUserName.trim()
                        ? UpdatedByUserName.trim()
                        : "System"
            });

            if (!result) {
                return res.status(404).json({
                    status: "error",
                    message: "Company role not found"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Company role updated successfully",
                data: result
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {
        console.error("Edit Company Role Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to update company role",
            error: error.message
        });
    }
};


// ======================================================
// FLAG ID 5 - ENABLE / DISABLE COMPANY ROLE
// ======================================================

export const updateCompanyRoleStatusController = async (req, res) => {
    const {
        FlagId,
        CompanyRoleId,
        IsDisabled
    } = req.body;

    try {
        if (parseInt(FlagId) === 4) {

            const CompanyId = getUserCompanyId(req);

            if (CompanyId === undefined) {
                return res.status(403).json({
                    status: "error",
                    message: "Company access information is missing or invalid"
                });
            }

            if (!isValidId(CompanyRoleId)) {
                return res.status(400).json({
                    status: "error",
                    message: "Valid CompanyRoleId is required"
                });
            }

            if (typeof IsDisabled !== "boolean") {
                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be true or false"
                });
            }

            // Check record access before updating.
            const existingRecord = await getCompanyRoleById(
                Number(CompanyRoleId),
                CompanyId
            );

            if (!existingRecord) {
                return res.status(404).json({
                    status: "error",
                    message: "Company role not found or access denied"
                });
            }

            if (existingRecord.IsDisabled === IsDisabled) {
                return res.status(200).json({
                    status: "success",
                    message: "No changes found",
                    data: existingRecord
                });
            }

            const result = await updateCompanyRoleStatus(
                Number(CompanyRoleId),
                IsDisabled
            );

            if (!result) {
                return res.status(404).json({
                    status: "error",
                    message: "Company role not found"
                });
            }

            return res.status(200).json({
                status: "success",
                message: IsDisabled
                    ? "Company role disabled successfully"
                    : "Company role enabled successfully",
                data: result
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {
        console.error("Update Company Role Status Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to update company role status",
            error: error.message
        });
    }
};



// ======================================================
// COMPANY ROLE DROPDOWNS
// FLAG ID 1 - COMPANY DROPDOWN
// FLAG ID 2 - ROLE DROPDOWN
// ======================================================

export const getCompanyRoleDropdown = async (req, res) => {
    const { FlagId } = req.body;

    try {

        // ==========================================
        // FLAG ID 1 - COMPANY DROPDOWN
        // ==========================================

        if (parseInt(FlagId) === 5) {

            const CompanyId = getUserCompanyId(req);

            if (CompanyId === undefined) {
                return res.status(403).json({
                    status: "error",
                    message: "Company access information is missing or invalid"
                });
            }

            const companies = await getCompanyDropdown(CompanyId);

            return res.status(200).json({
                status: "success",
                message: "Company dropdown fetched successfully",
                data: companies
            });
        }

        // ==========================================
        // FLAG ID 2 - ROLE DROPDOWN
        // ==========================================

        if (parseInt(FlagId) === 6) {

            const roles = await getRoleDropdown();

            return res.status(200).json({
                status: "success",
                message: "Role dropdown fetched successfully",
                data: roles
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId. Expected FlagId 1 or 2"
        });

    } catch (error) {
        console.error("Company Role Dropdown Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch company role dropdown",
            error: error.message
        });
    }
};