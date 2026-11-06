import {
    getAllRoles,
    addRole,
    updateRoles,
    deleteRoles,
    checkRoleExistsForUpdate,
    updateRoleStatus,
    checkRoleExists,
    checkCompanyExists,
    getCompaniesForRole,
    getCompanyDropdownData
} from "../../Models/RoleModels.js";


// =====================================================
// FLAG ID 1 - GET ALL ROLES
// =====================================================
export const getRole = async (req, res) => {
    const { FlagId, CompanyId } = req.body;

    try {
        if (parseInt(FlagId) === 1) {

            const loggedInCompanyId = req.user.CompanyId;

            if (loggedInCompanyId === undefined) {
                return res.status(403).json({
                    status: "error",
                    message: "Company access information is missing"
                });
            }

            const selectedCompanyId =
                loggedInCompanyId === null
                    ? (CompanyId || null)
                    : loggedInCompanyId;

            const roles = await getAllRoles(selectedCompanyId);

            return res.status(200).json({
                status: "success",
                message: "Roles fetched successfully",
                data: roles
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {
        console.error("Error fetching roles:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch roles",
            error: error.message
        });
    }
};
// =====================================================
// FLAG ID 2 - ADD ROLE
// =====================================================

export const addRoles = async (req, res) => {

    const { FlagId } = req.body;

    try {

        if (parseInt(FlagId) === 2) {

            const roleData = req.body;

            // ---------------------------------------------
            // COMPANY ID
            // ---------------------------------------------

            const loggedInCompanyId = req.user?.CompanyId;

            if (loggedInCompanyId !== null && loggedInCompanyId !== undefined) {

                roleData.CompanyId = Number(loggedInCompanyId);

            } else {

                if (
                    roleData.CompanyId !== undefined &&
                    roleData.CompanyId !== null &&
                    roleData.CompanyId !== ""
                ) {
                    roleData.CompanyId = Number(roleData.CompanyId);

                    if (
                        !Number.isInteger(roleData.CompanyId) ||
                        roleData.CompanyId <= 0
                    ) {
                        return res.status(400).json({
                            status: "error",
                            message: "Invalid CompanyId"
                        });
                    }

                    const companyExists = await checkCompanyExists(
                        roleData.CompanyId
                    );

                    if (companyExists.length === 0) {
                        return res.status(400).json({
                            status: "error",
                            message: "Invalid CompanyId"
                        });
                    }

                } else {
                    roleData.CompanyId = null;
                }
            }

            // ---------------------------------------------
            // VALIDATE ROLE NAME
            // ---------------------------------------------

            if (
                !roleData.RoleName ||
                !roleData.RoleName.trim()
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "RoleName is required"
                });
            }

            roleData.RoleName = roleData.RoleName.trim();

            const roleNameRegex = /^[A-Za-z ]{1,30}$/;

            if (!roleNameRegex.test(roleData.RoleName)) {
                return res.status(400).json({
                    status: "error",
                    message: "RoleName must contain only alphabetic characters and spaces, with a maximum length of 30 characters."
                });
            }

            // ---------------------------------------------
            // VALIDATE ROLE CODE
            // ---------------------------------------------

            if (
                !roleData.Role_Code ||
                !roleData.Role_Code.trim()
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "Role_Code is required"
                });
            }

            roleData.Role_Code = roleData.Role_Code.trim();

            const roleCodeRegex = /^[A-Za-z0-9]{1,15}$/;

            if (!roleCodeRegex.test(roleData.Role_Code)) {
                return res.status(400).json({
                    status: "error",
                    message: "Role_Code must contain only alphanumeric characters, with a maximum length of 15 characters."
                });
            }

            // ---------------------------------------------
            // VALIDATE CREATED USER
            // ---------------------------------------------

            if (
                !roleData.CreatedByUserName ||
                !roleData.CreatedByUserName.trim()
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "CreatedByUserName is required"
                });
            }

            // ---------------------------------------------
            // CHECK DUPLICATE ROLE
            // ---------------------------------------------

            const existingRole = await checkRoleExists(
                roleData.RoleName,
                roleData.Role_Code,
                roleData.CompanyId
            );

            if (existingRole.length > 0) {

                const roleNameExists = existingRole.some(
                    role =>
                        role.RoleName?.toLowerCase() ===
                        roleData.RoleName.toLowerCase()
                );

                const roleCodeExists = existingRole.some(
                    role =>
                        role.RoleCode?.toLowerCase() ===
                        roleData.Role_Code.toLowerCase()
                );

                if (roleNameExists && roleCodeExists) {
                    return res.status(409).json({
                        status: "error",
                        message: "Role name and role code already exist"
                    });
                }

                if (roleNameExists) {
                    return res.status(409).json({
                        status: "error",
                        message: "Role name already exists"
                    });
                }

                if (roleCodeExists) {
                    return res.status(409).json({
                        status: "error",
                        message: "Role code already exists"
                    });
                }
            }

            // ---------------------------------------------
            // ADD ROLE
            // ---------------------------------------------

            const role = await addRole(roleData);

            return res.status(201).json({
                status: "success",
                message: "Role added successfully",
                data: role
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {


        return res.status(500).json({
            status: "error",
            message: "Failed to add role",
            error: error.message
        });
    }
};

// =====================================================
// FLAG ID 3 - GET ALL COMPANY DATA
// =====================================================
export const getCompanyForRole = async (req, res) => {

    const { FlagId } = req.body;

    try {

        if (parseInt(FlagId) === 3) {

            const CompanyId = req.user?.CompanyId ?? null;

            const companies = await getCompaniesForRole(CompanyId);

            return res.status(200).json({
                status: "success",
                message: "Company data fetched successfully",
                data: companies
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        console.error("Error fetching company data:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch company data",
            error: error.message
        });
    }
};
// =====================================================
// FLAG ID 4 - EDIT ROLE
// =====================================================

export const updateRole = async (req, res) => {
    const { FlagId } = req.body;

    try {
        if (parseInt(FlagId) === 4) {
            const roleData = req.body;

            // ---------------------------------------------
            // GET LOGGED-IN USER COMPANY ID
            // ---------------------------------------------
            const loggedInCompanyId = req.user.CompanyId;

            if (loggedInCompanyId === undefined) {
                return res.status(403).json({
                    status: "error",
                    message: "Company access information is missing"
                });
            }

            // ---------------------------------------------
            // VALIDATE ROLE ID
            // ---------------------------------------------
            if (!roleData.RoleId) {
                return res.status(400).json({
                    status: "error",
                    message: "RoleId is required"
                });
            }

            // ---------------------------------------------
            // VALIDATE COMPANY ID
            // ---------------------------------------------
            if (loggedInCompanyId === null) {
                if (!roleData.CompanyId) {
                    return res.status(400).json({
                        status: "error",
                        message: "CompanyId is required"
                    });
                }

                const companyExists = await checkCompanyExists(
                    roleData.CompanyId
                );

                if (companyExists.length === 0) {
                    return res.status(400).json({
                        status: "error",
                        message: "Invalid CompanyId"
                    });
                }
            } else {
                roleData.CompanyId = loggedInCompanyId;
            }

            // ---------------------------------------------
            // VALIDATE ROLE NAME
            // ---------------------------------------------
            if (!roleData.RoleName || !roleData.RoleName.trim()) {
                return res.status(400).json({
                    status: "error",
                    message: "RoleName is required"
                });
            }

            roleData.RoleName = roleData.RoleName.trim();

            const roleNameRegex = /^[A-Za-z ]{1,30}$/;

            if (!roleNameRegex.test(roleData.RoleName)) {
                return res.status(400).json({
                    status: "error",
                    message: "RoleName must contain only alphabetic characters and spaces, with a maximum length of 30 characters."
                });
            }

            // ---------------------------------------------
            // VALIDATE ROLE CODE
            // ---------------------------------------------
            if (!roleData.Role_Code || !roleData.Role_Code.trim()) {
                return res.status(400).json({
                    status: "error",
                    message: "Role_Code is required"
                });
            }

            roleData.Role_Code = roleData.Role_Code.trim();

            const roleCodeRegex = /^[A-Za-z0-9]{1,15}$/;

            if (!roleCodeRegex.test(roleData.Role_Code)) {
                return res.status(400).json({
                    status: "error",
                    message: "Role_Code must contain only alphanumeric characters, with a maximum length of 15 characters."
                });
            }

            // ---------------------------------------------
            // VALIDATE UPDATED USER
            // ---------------------------------------------
            if (
                !roleData.UpdatedByUserName ||
                !roleData.UpdatedByUserName.trim()
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "UpdatedByUserName is required"
                });
            }

            // ---------------------------------------------
            // CHECK DUPLICATE ROLE NAME AND CODE
            // ---------------------------------------------
            const existingRoles = await checkRoleExistsForUpdate(
                roleData.RoleName,
                roleData.Role_Code,
                roleData.RoleId,
                roleData.CompanyId
            );

            const roleNameExists = existingRoles.some(
                role =>
                    role.RoleName?.toLowerCase() ===
                    roleData.RoleName.toLowerCase()
            );

            const roleCodeExists = existingRoles.some(
                role =>
                    role.RoleCode?.toLowerCase() ===
                    roleData.Role_Code.toLowerCase()
            );

            if (roleNameExists && roleCodeExists) {
                return res.status(409).json({
                    status: "error",
                    message: "Role name and role code already exist"
                });
            }

            if (roleNameExists) {
                return res.status(409).json({
                    status: "error",
                    message: "Role name already exists"
                });
            }

            if (roleCodeExists) {
                return res.status(409).json({
                    status: "error",
                    message: "Role code already exists"
                });
            }

            // ---------------------------------------------
            // UPDATE ROLE
            // ---------------------------------------------
            const result = await updateRoles(
                roleData,
                loggedInCompanyId
            );

            if (result === 0) {
                return res.status(404).json({
                    status: "error",
                    message: "Role not found"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Role updated successfully",
                data: result
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {
        console.error("Error updating role:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to update role",
            error: error.message
        });
    }
};
// =====================================================
// FLAG ID 5 - DELETE ROLE
// =====================================================

export const deleteRole = async (req, res) => {

    const { FlagId } = req.body;

    try {

        if (parseInt(FlagId) === 5) {

            const roleData = req.body;

            if (!roleData.RoleId) {

                return res.status(400).json({
                    status: "error",
                    message: "RoleId is required"
                });
            }


            const role = await deleteRoles(roleData);


            if (role === 0) {

                return res.status(404).json({
                    status: "error",
                    message: "Role not found"
                });
            }


            return res.status(200).json({
                status: "success",
                message: "Role deleted successfully",
                data: role
            });
        }


        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        console.error("Error deleting role:", error);


        if (error.code === "ROLE_IN_USE") {

            return res.status(409).json({
                status: "error",
                message: "Role cannot be deleted because it is being used"
            });
        }


        return res.status(500).json({
            status: "error",
            message: "Failed to delete role",
            error: error.message
        });
    }
};
// =====================================================
// FLAG ID 6 - UPDATE ROLE STATUS
// =====================================================
export const updateRoleStatusController = async (req, res) => {

    const {
        FlagId,
        RoleId,
        IsDisabled
    } = req.body;

    try {

        if (parseInt(FlagId) === 6) {


            // ---------------------------------------------
            // VALIDATE ROLE ID
            // ---------------------------------------------

            if (!RoleId) {

                return res.status(400).json({
                    status: "error",
                    message: "RoleId is required"
                });
            }


            // ---------------------------------------------
            // VALIDATE IS DISABLED
            // ---------------------------------------------

            if (typeof IsDisabled !== "boolean") {

                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be true or false"
                });
            }


            // ---------------------------------------------
            // UPDATE STATUS
            // ---------------------------------------------

            const result = await updateRoleStatus(
                RoleId,
                IsDisabled
            );


            if (result === 0) {

                return res.status(404).json({
                    status: "error",
                    message: "Role not found"
                });
            }


            return res.status(200).json({
                status: "success",
                message: IsDisabled
                    ? "Role disabled successfully"
                    : "Role enabled successfully",
                data: result
            });
        }


        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        console.error("Error updating role status:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to update role status",
            error: error.message
        });
    }
};


export const getCompanyDropdown = async (req, res) => {
    const { FlagId } = req.body;
    try {
        if (parseInt(FlagId) === 1) {
            const rows = await getCompanyDropdownData();
            return res.status(200).json({
                status: "success",
                message: "Company dropdown fetched successfully",
                data: rows
            });
        }
        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {
        console.error("Error fetching company dropdown:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch company dropdown",
            error: error.message
        });
    }
};

