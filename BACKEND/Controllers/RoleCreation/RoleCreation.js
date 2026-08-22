import {
    getAllRoles,
    addRole,
    updateRoles,
    deleteRoles,
    checkRoleExistsForUpdate,
    updateRoleStatus,
    checkRoleExists,
    checkCompanyExists,
    getCompaniesForRole
} from "../../Models/RoleModels.js";


// =====================================================
// FLAG ID 1 - GET ALL ROLES
// =====================================================

export const getRole = async (req, res) => {

    const { FlagId } = req.body;

    try {

        if (parseInt(FlagId) === 1) {

            const rows = await getAllRoles();

            return res.status(200).json({
                status: "success",
                message: "Roles fetched successfully",
                data: rows
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
            // VALIDATE COMPANY ID
            // ---------------------------------------------

            if (!roleData.CompanyId) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }


            // ---------------------------------------------
            // CHECK COMPANY
            // ---------------------------------------------

            const companyExists = await checkCompanyExists(
                roleData.CompanyId
            );

            if (companyExists.length === 0) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid CompanyId"
                });
            }


            // ---------------------------------------------
            // VALIDATE ROLE NAME
            // ---------------------------------------------

            if (!roleData.RoleName) {

                return res.status(400).json({
                    status: "error",
                    message: "RoleName is required"
                });
            }


            // ---------------------------------------------
            // VALIDATE ROLE CODE
            // ---------------------------------------------

            if (!roleData.Role_Code) {

                return res.status(400).json({
                    status: "error",
                    message: "Role_Code is required"
                });
            }


            // ---------------------------------------------
            // VALIDATE CREATED USER
            // ---------------------------------------------

            if (!roleData.RequestUserName) {

                return res.status(400).json({
                    status: "error",
                    message: "RequestUserName is required"
                });
            }


            // ---------------------------------------------
            // CHECK DUPLICATE ROLE
            // ---------------------------------------------

            const existingRole = await checkRoleExists(
                roleData.RoleName,
                roleData.Role_Code
            );

            if (existingRole.length > 0) {

                const role = existingRole[0];

                if (role.RoleName === roleData.RoleName) {

                    return res.status(409).json({
                        status: "error",
                        message: "Role name already exists"
                    });
                }

                if (role.RoleCode === roleData.Role_Code) {

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

        console.error("Error adding role:", error);

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
// ONLY FlagId IS REQUIRED
// =====================================================

export const getCompanyForRole = async (req, res) => {

    const { FlagId } = req.body;

    try {

        if (parseInt(FlagId) === 3) {

            const companies = await getCompaniesForRole();

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

            if (!roleData.CompanyId) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }


            // ---------------------------------------------
            // CHECK COMPANY
            // ---------------------------------------------

            const companyExists = await checkCompanyExists(
                roleData.CompanyId
            );

            if (companyExists.length === 0) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid CompanyId"
                });
            }


            // ---------------------------------------------
            // VALIDATE ROLE NAME
            // ---------------------------------------------

            if (!roleData.RoleName) {

                return res.status(400).json({
                    status: "error",
                    message: "RoleName is required"
                });
            }


            // ---------------------------------------------
            // VALIDATE ROLE CODE
            // ---------------------------------------------

            if (!roleData.Role_Code) {

                return res.status(400).json({
                    status: "error",
                    message: "Role_Code is required"
                });
            }


            // ---------------------------------------------
            // VALIDATE UPDATED USER
            // ---------------------------------------------

            if (!roleData.UpdatedByUserName) {

                return res.status(400).json({
                    status: "error",
                    message: "UpdatedByUserName is required"
                });
            }


            // ---------------------------------------------
            // CHECK DUPLICATE ROLE
            // ---------------------------------------------

            const existingRoles = await checkRoleExistsForUpdate(
                roleData.RoleName,
                roleData.Role_Code,
                roleData.RoleId
            );


            for (const role of existingRoles) {

                if (role.RoleName === roleData.RoleName) {

                    return res.status(409).json({
                        status: "error",
                        message: "Role name already exists"
                    });
                }

                if (role.RoleCode === roleData.Role_Code) {

                    return res.status(409).json({
                        status: "error",
                        message: "Role code already exists"
                    });
                }
            }


            // ---------------------------------------------
            // UPDATE ROLE
            // ---------------------------------------------

            const result = await updateRoles(roleData);


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