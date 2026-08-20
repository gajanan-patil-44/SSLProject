import { getAllRoles, addRole, updateRoles, deleteRoles, checkRoleName,checkRoleCode, updateRoleStatus,addRoleCode,addRoleName } from "../../Models/RoleModels.js";


// ==========================================
// GET ALL ROLES
// ==========================================
export const getRole = async (req, res) => {
    const { FlagId } = req.body;

    try {

        // FlagId 1 = Get All Roles
        if (parseInt(FlagId) === 1) {

            const rows = await getAllRoles();

            return res.status(200).json({
                status: "success",
                message: "Roles fetched successfully",
                data: rows
            });
        }

        // Invalid FlagId
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

// ==========================================
// ADD ROLE
// ==========================================

export const addRoles = async (req, res) => {

    const { FlagId } = req.body;

    try {

        // FlagId 1 = Add Role
        if (parseInt(FlagId) === 1) {

            const roleData = req.body;

            console.log("Received role data:", roleData);


            // Check Role Name
            const roleName = await addRoleName(
                roleData.RoleName
            );

            if (roleName.length > 0) {

                return res.status(409).json({
                    status: "error",
                    message: "Role name already exists"
                });
            }


            // Check Role Code
            const roleCode = await addRoleCode(
                roleData.Role_Code
            );

            if (roleCode.length > 0) {

                return res.status(409).json({
                    status: "error",
                    message: "Role code already exists"
                });
            }


            // Add Role
            const role = await addRole(roleData);

            return res.status(201).json({
                status: "success",
                message: "Role added successfully",
                data: role
            });
        }


        // Invalid FlagId
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

// ==========================================
// UPDATE ROLE
// ==========================================

export const updateRole = async (req, res) => {

    const { FlagId } = req.body;

    try {

        // FlagId 1 = Update Role
        if (parseInt(FlagId) === 1) {
            const roleData = req.body;
            console.log("Received update role data:", roleData);

            // Check Role Name
            const roleName = await checkRoleName(
                roleData.RoleName,
                roleData.RoleId
            );

            if (roleName.length > 0) {
                return res.status(409).json({
                    status: "error",
                    message: "Role name already exists"
                });
            }

            // Check Role Code
            const roleCode = await checkRoleCode(
                roleData.Role_Code,
                roleData.RoleId
            );

            if (roleCode.length > 0) {
                return res.status(409).json({
                    status: "error",
                    message: "Role code already exists"
                });
            }

            // Update Role
            const role = await updateRoles(roleData);
            return res.status(200).json({
                status: "success",
                message: "Role updated successfully",
                data: role
            });
        }

        // Invalid FlagId
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
// ==========================================
// DELETE ROLE
// ==========================================

export const deleteRole = async (req, res) => {
    const { FlagId } = req.body;

    try {

        // FlagId 1 = Delete Role
        if (parseInt(FlagId) === 1) {
            const roleData = req.body;
            console.log("Received delete role data:", roleData);
            const role = await deleteRoles(roleData);
            return res.status(200).json({
                status: "success",
                message: "Role deleted successfully",
                data: role
            });
        }

        // Invalid FlagId
        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        console.error("Error deleting role:", error);

        // Role is being used
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



export const updateRoleStatusController = async (req, res) => {

    const { FlagId, RoleId, IsDisabled } = req.body;

    try {

        // FlagId 1 = Update Role Status
        if (parseInt(FlagId) === 1) {

            // Make sure IsDisabled is boolean
            if (typeof IsDisabled !== "boolean") {
                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be true or false"
                });
            }

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