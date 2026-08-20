import { getAllRoles, addRole, updateRoles, deleteRoles } from "../../Models/RoleModels.js";


// ==========================================
// GET ALL ROLES
// ==========================================
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

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid FlagId."
            });

        }

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
        if (parseInt(FlagId) === 1) {
            const roleData = req.body;
            console.log("Received role data:", roleData);
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

        // PostgreSQL unique constraint violation
        if (error.code === "23505") {

            return res.status(409).json({
                status: "error",
                message: "Role name or Role code already exists"
            });
        }

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

        // PostgreSQL unique constraint violation
        if (error.code === "23505") {

            return res.status(409).json({
                status: "error",
                message: "Role name or Role code already exists"
            });
        }

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

        // Foreign key constraint violation
        if (error.code === "23503") {

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