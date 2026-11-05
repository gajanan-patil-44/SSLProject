
import {
    getAllLocationTypes,
    getLocationTypeCount,
    getLocationTypeById,
    checkLocationTypeExists,
    checkParentLocationExists,
    addLocationType,
    getParentLocationDropdown,
    updateLocationType
} from "../../Models/LocationTypeMaster/LocationTypeMasterModels.js";

// =====================================================
// FLAG ID 1 - VIEW ALL LOCATION TYPES
// =====================================================

export const getLocationTypes = async (req, res) => {

    const { FlagId } = req.body;

    try {

        if (parseInt(FlagId) === 1) {

            const rows = await getAllLocationTypes();

            return res.status(200).json({
                status: "success",
                message: "Location Types fetched successfully",
                data: rows
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        console.error("Error fetching Location Types:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch Location Types",
            error: error.message
        });
    }
};

// =====================================================
// FLAG ID 2 - ADD LOCATION TYPE
// =====================================================

export const createLocationType = async (req, res) => {

    const { FlagId } = req.body;

    try {

        if (parseInt(FlagId) === 2) {

            const locationData = req.body;

            // ---------------------------------------------
            // VALIDATE LOCATION TYPE NAME
            // Alphabetic characters and spaces only
            // Maximum length: 50 characters
            // ---------------------------------------------

            if (
                !locationData.LocationTypeMasterName ||
                typeof locationData.LocationTypeMasterName !== "string" ||
                !locationData.LocationTypeMasterName.trim()
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "LocationTypeMasterName is required"
                });
            }

            locationData.LocationTypeMasterName =
                locationData.LocationTypeMasterName.trim();

            const locationNameRegex = /^[A-Za-z ]{1,50}$/;

            if (!locationNameRegex.test(
                locationData.LocationTypeMasterName
            )) {

                return res.status(400).json({
                    status: "error",
                    message: "Location Type Name must contain only alphabets and spaces, with a maximum length of 50 characters."
                });
            }

            // ---------------------------------------------
            // VALIDATE CREATED USER
            // ---------------------------------------------

            if (
                !locationData.CreatedByUserName ||
                typeof locationData.CreatedByUserName !== "string" ||
                !locationData.CreatedByUserName.trim()
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "CreatedByUserName is required"
                });
            }

            locationData.CreatedByUserName =
                locationData.CreatedByUserName.trim();

            // ---------------------------------------------
            // CHECK DUPLICATE LOCATION TYPE NAME
            // ---------------------------------------------

            const existingLocation = await checkLocationTypeExists(
                locationData.LocationTypeMasterName
            );

            if (existingLocation.length > 0) {

                return res.status(409).json({
                    status: "error",
                    message: "Location Type Name already exists"
                });
            }

            // ---------------------------------------------
            // CHECK FIRST LOCATION TYPE
            // First record does not require ParentTypeId
            // ---------------------------------------------

            const totalCount = await getLocationTypeCount();

            if (totalCount === 0) {

                locationData.ParentTypeId = null;

            } else {

                // ---------------------------------------------
                // VALIDATE PARENT TYPE ID
                // All subsequent records require ParentTypeId
                // ---------------------------------------------

                if (
                    locationData.ParentTypeId === undefined ||
                    locationData.ParentTypeId === null ||
                    locationData.ParentTypeId === ""
                ) {

                    return res.status(400).json({
                        status: "error",
                        message: "ParentTypeId is required"
                    });
                }

                const parentId = parseInt(
                    locationData.ParentTypeId
                );

                if (
                    isNaN(parentId) ||
                    parentId <= 0 ||
                    String(parentId) !== String(locationData.ParentTypeId).trim()
                ) {

                    return res.status(400).json({
                        status: "error",
                        message: "ParentTypeId must be a valid positive integer"
                    });
                }

                // ---------------------------------------------
                // CHECK PARENT LOCATION EXISTS
                // ---------------------------------------------

                const parentExists = await checkParentLocationExists(
                    parentId
                );

                if (!parentExists) {

                    return res.status(400).json({
                        status: "error",
                        message: "Invalid ParentTypeId"
                    });
                }

                locationData.ParentTypeId = parentId;
            }

            // ---------------------------------------------
            // ADD LOCATION TYPE
            // ---------------------------------------------

            const result = await addLocationType(locationData);

            return res.status(201).json({
                status: "success",
                message: "Location Type added successfully",
                data: result
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        console.error("Error adding Location Type:", error);

        if (error.code === "23505") {

            return res.status(409).json({
                status: "error",
                message: "Location Type Name already exists"
            });
        }

        return res.status(500).json({
            status: "error",
            message: "Failed to add Location Type",
            error: error.message
        });
    }
};

// =====================================================
// FLAG ID 3 - GET PARENT LOCATION DROPDOWN
// =====================================================

export const getLocationParentDropdown = async (req, res) => {

    const { FlagId } = req.body;

    try {

        if (parseInt(FlagId) === 3) {

            const rows = await getParentLocationDropdown();

            return res.status(200).json({
                status: "success",
                message: "Parent Location dropdown fetched successfully",
                data: rows
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        console.error("Error fetching Parent Location:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch Parent Location dropdown",
            error: error.message
        });
    }
};

// =====================================================
// FLAG ID 4 - EDIT LOCATION TYPE
// =====================================================

export const editLocationType = async (req, res) => {

    const { FlagId } = req.body;

    try {

        if (parseInt(FlagId) === 4) {

            const locationData = req.body;

            // ---------------------------------------------
            // VALIDATE LOCATION TYPE ID
            // ---------------------------------------------

            if (
                !locationData.LocationTypeMasterId ||
                isNaN(parseInt(locationData.LocationTypeMasterId)) ||
                parseInt(locationData.LocationTypeMasterId) <= 0 ||
                String(parseInt(locationData.LocationTypeMasterId)) !==
                String(locationData.LocationTypeMasterId).trim()
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "Valid LocationTypeMasterId is required"
                });
            }

            locationData.LocationTypeMasterId = parseInt(
                locationData.LocationTypeMasterId
            );

            // ---------------------------------------------
            // CHECK LOCATION TYPE EXISTS
            // ---------------------------------------------

            const existingLocation = await getLocationTypeById(
                locationData.LocationTypeMasterId
            );

            if (!existingLocation) {

                return res.status(404).json({
                    status: "error",
                    message: "Location Type not found"
                });
            }

            // ---------------------------------------------
            // VALIDATE LOCATION TYPE NAME
            // Alphabetic characters and spaces only
            // Maximum length: 50 characters
            // ---------------------------------------------

            if (
                !locationData.LocationTypeMasterName ||
                typeof locationData.LocationTypeMasterName !== "string" ||
                !locationData.LocationTypeMasterName.trim()
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "LocationTypeMasterName is required"
                });
            }

            locationData.LocationTypeMasterName =
                locationData.LocationTypeMasterName.trim();

            const locationNameRegex = /^[A-Za-z ]{1,50}$/;

            if (!locationNameRegex.test(
                locationData.LocationTypeMasterName
            )) {

                return res.status(400).json({
                    status: "error",
                    message: "Location Type Name must contain only alphabets and spaces, with a maximum length of 50 characters."
                });
            }

            // ---------------------------------------------
            // VALIDATE UPDATED USER
            // ---------------------------------------------

            if (
                !locationData.UpdatedByUserName ||
                typeof locationData.UpdatedByUserName !== "string" ||
                !locationData.UpdatedByUserName.trim()
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "UpdatedByUserName is required"
                });
            }

            locationData.UpdatedByUserName =
                locationData.UpdatedByUserName.trim();

            // ---------------------------------------------
            // FIRST LOCATION TYPE
            // LocationTypeMasterId 1 has no ParentTypeId
            // ---------------------------------------------

            if (locationData.LocationTypeMasterId === 1) {

                locationData.ParentTypeId = null;

            } else {

                // ---------------------------------------------
                // VALIDATE PARENT TYPE ID
                // ---------------------------------------------

                if (
                    locationData.ParentTypeId === undefined ||
                    locationData.ParentTypeId === null ||
                    locationData.ParentTypeId === ""
                ) {

                    return res.status(400).json({
                        status: "error",
                        message: "ParentTypeId is required"
                    });
                }

                const parentId = parseInt(
                    locationData.ParentTypeId
                );

                if (
                    isNaN(parentId) ||
                    parentId <= 0 ||
                    String(parentId) !== String(locationData.ParentTypeId).trim()
                ) {

                    return res.status(400).json({
                        status: "error",
                        message: "ParentTypeId must be a valid positive integer"
                    });
                }

                if (
                    parentId === locationData.LocationTypeMasterId
                ) {

                    return res.status(400).json({
                        status: "error",
                        message: "A Location Type cannot be its own parent"
                    });
                }

                // ---------------------------------------------
                // CHECK PARENT LOCATION EXISTS
                // ---------------------------------------------

                const parentExists = await checkParentLocationExists(
                    parentId
                );

                if (!parentExists) {

                    return res.status(400).json({
                        status: "error",
                        message: "Invalid ParentTypeId"
                    });
                }

                locationData.ParentTypeId = parentId;
            }

            // ---------------------------------------------
            // CHECK DUPLICATE LOCATION TYPE NAME
            // Exclude current LocationTypeMasterId
            // ---------------------------------------------

            const existingLocations = await checkLocationTypeExists(
                locationData.LocationTypeMasterName,
                locationData.LocationTypeMasterId
            );

            if (existingLocations.length > 0) {

                return res.status(409).json({
                    status: "error",
                    message: "Location Type Name already exists"
                });
            }

            // ---------------------------------------------
            // UPDATE LOCATION TYPE
            // ---------------------------------------------

            const result = await updateLocationType(locationData);

            if (!result) {

                return res.status(404).json({
                    status: "error",
                    message: "Location Type not found"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Location Type updated successfully",
                data: result
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        console.error("Error updating Location Type:", error);

        if (error.code === "23505") {

            return res.status(409).json({
                status: "error",
                message: "Location Type Name already exists"
            });
        }

        return res.status(500).json({
            status: "error",
            message: "Failed to update Location Type",
            error: error.message
        });
    }
};
