

import {
    getLocationTypes,
    getParentLocationTypes,
    getParentLocationMasters,
    checkCompanyMasterExists,
    checkLocationTypeExists,
    checkParentLocationExists,
    checkLocationEmailExists,
    checkLocationContactExists,
    addLocation
} from "../../Models/LocationMaster/LocationMasterModel.js";


// 1. Location Type dropdown
export const getLocationTypeController = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (Number(flagId) !== 1) {

            return res.status(400).json({
                status: "error",
                message: "Use flagId 1 to get Location Type."
            });
        }

        const result = await getLocationTypes();

        return res.status(200).json({
            status: "success",
            message: "Location Types fetched successfully.",
            data: result
        });

    } catch (error) {

        // console.error("Get Location Type Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch Location Types.",
            error: error.message
        });
    }
};


// 2. Parent Location Type dropdown
export const getParentLocationTypeController = async (req, res) => {

    const { flagId, LocationTypeMasterId } = req.body;

    try {

        if (Number(flagId) !== 2) {

            return res.status(400).json({
                status: "error",
                message: "Use flagId 2 to get Parent Location Type."
            });
        }

        if (!LocationTypeMasterId || !Number.isInteger(Number(LocationTypeMasterId)) || Number(LocationTypeMasterId) <= 0) {

            return res.status(400).json({
                status: "error",
                message: "Valid LocationTypeMasterId is required."
            });
        }

        const result = await getParentLocationTypes(Number(LocationTypeMasterId));

        return res.status(200).json({
            status: "success",
            message: "Parent Location Type fetched successfully.",
            data: result
        });

    } catch (error) {

        // console.error("Get Parent Location Type Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch Parent Location Type.",
            error: error.message
        });
    }
};


// 3. Parent Location Master dropdown

export const getParentLocationMasterController = async (req, res) => {

    const { flagId, ParentLocationTypeMasterId } = req.body;

    try {

        if (Number(flagId) !== 3) {
            return res.status(400).json({
                status: "error",
                message: "Use flagId 3 to get Parent Location Master."
            });
        }

        if (
            !ParentLocationTypeMasterId ||
            !Number.isInteger(Number(ParentLocationTypeMasterId)) ||
            Number(ParentLocationTypeMasterId) <= 0
        ) {

            return res.status(400).json({
                status: "error",
                message: "Valid ParentLocationTypeMasterId is required."
            });
        }

        const result = await getParentLocationMasters(
            Number(ParentLocationTypeMasterId)
        );

        return res.status(200).json({
            status: "success",
            message: "Parent Location Master fetched successfully.",
            data: result
        });

    } catch (error) {

        // console.error("Get Parent Location Master Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch Parent Location Master.",
            error: error.message
        });
    }
};



// 4. Add Location Details and Contact Channels


export const addLocationMaster = async (req, res) => {

    const {
        flagId,
        CompanyMasterId,
        LocationTypeMasterId,
        ParentLocationTypeMasterId,
        ParentLocationMasterId,
        LocationName,
        ContactPerson,
        ContactNumber,
        EmailId,
        Address,
        CreatedByUserName
    } = req.body;

    try {

        // Flag validation
        if (Number(flagId) !== 4) {
            return res.status(400).json({
                status: "error",
                message: "Use flagId 4 to add Location Details."
            });
        }

        // Required field validation
        if (
            !CompanyMasterId ||
            !LocationTypeMasterId ||
            !LocationName ||
            !ContactPerson ||
            !ContactNumber ||
            !EmailId ||
            !Address ||
            !CreatedByUserName
        ) {
            return res.status(400).json({
                status: "error",
                message: "All Location Details and Contact Channels fields are mandatory."
            });
        }

        // ID validation
        if (
            !Number.isInteger(Number(CompanyMasterId)) ||
            Number(CompanyMasterId) <= 0 ||
            !Number.isInteger(Number(LocationTypeMasterId)) ||
            Number(LocationTypeMasterId) <= 0
        ) {

            return res.status(400).json({
                status: "error",
                message: "CompanyMasterId and LocationTypeMasterId must be valid positive integers."
            });
        }

        // Location Name validation
        if (
            typeof LocationName !== "string" ||
            !LocationName.trim() ||
            LocationName.trim().length > 100
        ) {

            return res.status(400).json({
                status: "error",
                message: "LocationName is required and cannot exceed 100 characters."
            });
        }

        // Contact Person validation
        if (
            typeof ContactPerson !== "string" ||
            !ContactPerson.trim() ||
            ContactPerson.trim().length > 100
        ) {

            return res.status(400).json({
                status: "error",
                message: "ContactPerson is required and cannot exceed 100 characters."
            });
        }

        // Contact Number validation - exactly 10 digits
        if (!/^[0-9]{10}$/.test(String(ContactNumber).trim())) {

            return res.status(400).json({
                status: "error",
                message: "ContactNumber must contain exactly 10 digits."
            });
        }

        // Email validation
        const email = String(EmailId).trim();

        if (email.length > 100 || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {

            return res.status(400).json({
                status: "error",
                message: "Please enter a valid EmailId."
            });
        }

        // Address validation
        if (typeof Address !== "string" ||!Address.trim()) {

            return res.status(400).json({
                status: "error",
                message: "Address is required."
            });
        }

        // CreatedByUserName validation
        if (typeof CreatedByUserName !== "string" || !CreatedByUserName.trim()) {

            return res.status(400).json({
                status: "error",
                message: "CreatedByUserName is required."
            });
        }

        // Check Company Master
        const companyExists = await checkCompanyMasterExists(
            Number(CompanyMasterId)
        );

        if (!companyExists) {
            return res.status(400).json({
                status: "error",
                message: "Invalid or inactive CompanyMasterId."
            });
        }

        // Check Location Type
        const locationType = await checkLocationTypeExists(
            Number(LocationTypeMasterId)
        );

        if (!locationType) {
            return res.status(400).json({
                status: "error",
                message: "Invalid or inactive LocationTypeMasterId."
            });
        }

        // Root Location Type validation
        if (locationType.ParentTypeId === null) {

            if (
                (ParentLocationTypeMasterId !== undefined &&
                    ParentLocationTypeMasterId !== null &&
                    ParentLocationTypeMasterId !== "") ||
                (ParentLocationMasterId !== undefined &&
                    ParentLocationMasterId !== null &&
                    ParentLocationMasterId !== "")
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "Parent Location Type and Parent Location Master are not required for a root Location Type."
                });
            }

        } else {

            // Parent Location Type is mandatory for non-root locations
            if (
                !ParentLocationTypeMasterId ||
                !Number.isInteger(Number(ParentLocationTypeMasterId)) ||
                Number(ParentLocationTypeMasterId) <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "ParentLocationTypeMasterId is required."
                });
            }

            // Check whether selected Parent Location Type matches the configured parent type
            if (
                Number(ParentLocationTypeMasterId) !==
                Number(locationType.ParentTypeId)
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid ParentLocationTypeMasterId for the selected Location Type."
                });
            }

            // Parent Location Master is mandatory for non-root locations
            if (
                !ParentLocationMasterId ||
                !Number.isInteger(Number(ParentLocationMasterId)) ||
                Number(ParentLocationMasterId) <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "ParentLocationMasterId is required."
                });
            }

            // Check Parent Location Master
            const parentExists = await checkParentLocationExists(
                Number(LocationTypeMasterId),
                Number(ParentLocationTypeMasterId),
                Number(ParentLocationMasterId),
                Number(CompanyMasterId)
            );

            if (!parentExists) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid Parent Location Master. Select a valid parent location belonging to the same company."
                });
            }
        }

        // Check duplicate Email
        const emailExists = await checkLocationEmailExists(
            email,
            Number(CompanyMasterId)
        );

        if (emailExists) {

            return res.status(400).json({
                status: "error",
                message: "This EmailId already exists for this company."
            });
        }

        // Check duplicate Contact Number
        const contactExists = await checkLocationContactExists(
            String(ContactNumber).trim(),
            Number(CompanyMasterId)
        );

        if (contactExists) {
            
            return res.status(400).json({
                status: "error",
                message: "This ContactNumber already exists for this company."
            });
        }

        // Prepare data for insertion
        const locationData = {
            CompanyMasterId: Number(CompanyMasterId),
            LocationTypeMasterId: Number(LocationTypeMasterId),

            ParentLocationMasterId:
                locationType.ParentTypeId === null
                    ? null
                    : Number(ParentLocationMasterId),

            LocationName: LocationName.trim(),
            ContactPerson: ContactPerson.trim(),
            ContactNumber: String(ContactNumber).trim(),
            EmailId: email,
            Address: Address.trim(),
            CreatedByUserName: CreatedByUserName.trim()
        };

        // Add Location
        const result = await addLocation(locationData);

        return res.status(201).json({
            status: "success",
            message: "Location added successfully.",
            data: result
        });

    } catch (error) {

        // console.error("Add Location Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to add Location.",
            error: error.message
        });
    }
};

