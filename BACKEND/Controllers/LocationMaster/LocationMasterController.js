
import {
    getLocationTypesForDropdown,
    getParentLocationTypeForDropdown,
    getParentLocationsForDropdown,
    checkCompanyMasterExists,
    checkLocationTypeExists,
    checkValidParentLocation,
    checkLocationContactExists,
    checkLocationEmailExists,
    addLocationMasters

} from "../../Models/LocationMaster/LocationMasterModel.js";


// COMMON ID VALIDATION

const isValidId = (value) => {

    return (

        value !== undefined &&
        value !== null &&
        value !== "" &&
        Number.isInteger(Number(value)) &&
        Number(value) > 0

    );

};


// 1. GET LOCATION TYPE DROPDOWN

export const getLocationTypes = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (Number(flagId) !== 1) {

            return res.status(400).json({

                status: "error",
                message: "Use FlagId 1 to fetch Location Types"

            });

        }

        const locationTypes = await getLocationTypesForDropdown();

        return res.status(200).json({
            status: "success",
            message: "Location types fetched successfully",
            data: locationTypes
        });


    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: error.message
        });

    }

};


// 2. GET PARENT LOCATION TYPE DROPDOWN

export const getParentLocationTypes = async (req, res) => {

    const { flagId, LocationTypeMasterId } = req.body;

    try {

        if (Number(flagId) !== 2) {

            return res.status(400).json({
                status: "error",
                message: "Use FlagId 2 to fetch Parent Location Type"
            });

        }


        if (!isValidId(LocationTypeMasterId)) {

            return res.status(400).json({
                status: "error",
                message: "Valid LocationTypeMasterId is required"

            });

        }


        const parentType = await getParentLocationTypeForDropdown(
            Number(LocationTypeMasterId)
        );


        if (!parentType) {

            return res.status(404).json({
                status: "error",
                message: "Location type not found or inactive"
            });

        }


        // ROOT TYPE DOES NOT HAVE A PARENT

        if (parentType.ParentTypeId === null) {

            return res.status(200).json({
                status: "success",
                message: "Parent Location Information is not required",
                data: {
                    ParentTypeId: null,
                    ParentLocationTypeId: null,
                    ParentLocationTypeName: null
                }

            });

        }


        // CHECK PARENT TYPE IS ACTIVE

        if (!parentType.ParentLocationTypeId) {

            return res.status(400).json({
                status: "error",
                message: "Parent Location Type is inactive or unavailable"
            });

        }


        return res.status(200).json({
            status: "success",
            message: "Parent Location Type fetched successfully",
            data: parentType
        });


    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: error.message

        });

    }

};


// 3. GET PARENT LOCATION NAME DROPDOWN

export const getParentLocations = async (req, res) => {

    const {
        flagId,
        LocationTypeMasterId,
        CompanyMasterId
    } = req.body;

    try {

        if (Number(flagId) !== 3) {

            return res.status(400).json({
                status: "error",
                message: "Use FlagId 3 to fetch Parent Locations"
            });

        }


        if (!isValidId(LocationTypeMasterId)) {

            return res.status(400).json({
                status: "error",
                message: "Valid LocationTypeMasterId is required"
            });

        }


        if (!isValidId(CompanyMasterId)) {

            return res.status(400).json({
                status: "error",
                message: "Valid CompanyMasterId is required"
            });

        }


        // GET SELECTED LOCATION TYPE AND ITS PARENT TYPE

        const parentType = await getParentLocationTypeForDropdown(
            Number(LocationTypeMasterId)
        );


        if (!parentType) {

            return res.status(404).json({
                status: "error",
                message: "Location type not found or inactive"

            });

        }


        // ROOT TYPE DOES NOT REQUIRE PARENT LOCATIONS

        if (parentType.ParentTypeId === null) {

            return res.status(200).json({
                status: "success",
                message: "Parent location is not required",
                data: []

            });

        }


        if (!parentType.ParentLocationTypeId) {

            return res.status(400).json({
                status: "error",
                message: "Parent Location Type is inactive or unavailable"
            });

        }


        // FETCH LOCATIONS OF THE PARENT TYPE

        const parentLocations = await getParentLocationsForDropdown(
            parentType.ParentTypeId,
            Number(CompanyMasterId)
        );


        return res.status(200).json({
            status: "success",
            message: "Parent Locations fetched successfully",
            data: parentLocations
        });


    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: error.message

        });

    }

};


// 4. ADD LOCATION MASTER

export const addLocationMaster = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (Number(flagId) !== 4) {

            return res.status(400).json({
                status: "error",
                message: "Use FlagId 2 to insert LocationMaster"
            });

        }

        const {

            CompanyMasterId,
            LocationTypeMasterId,
            ParentLocationMasterId,
            LocationName,
            ContactPerson,
            ContactNumber,
            EmailId,
            Address,
            CreatedByUserName

        } = req.body;


        // VALIDATE COMPANY MASTER ID

        if (!isValidId(CompanyMasterId)) {

            return res.status(400).json({
                status: "error",
                message: "Valid CompanyMasterId is required"
            });

        }


        const existingCompany = await checkCompanyMasterExists(
            Number(CompanyMasterId)
        );


        if (!existingCompany) {

            return res.status(404).json({
                status: "error",
                message: "CompanyMaster not found"
            });

        }


        // VALIDATE LOCATION TYPE ID

        if (!isValidId(LocationTypeMasterId)) {

            return res.status(400).json({
                status: "error",
                message: "Valid LocationTypeMasterId is required"
            });

        }


        // VALIDATE LOCATION NAME

        if (
            typeof LocationName !== "string" ||
            !LocationName.trim()
        ) {

            return res.status(400).json({
                status: "error",
                message: "LocationName is required"
            });

        }


        if (LocationName.trim().length > 100) {

            return res.status(400).json({
                status: "error",
                message: "LocationName cannot exceed 100 characters"
            });

        }


        // VALIDATE CONTACT PERSON

        if (
            typeof ContactPerson !== "string" ||
            !ContactPerson.trim()
        ) {

            return res.status(400).json({
                status: "error",
                message: "ContactPerson is required"
            });

        }


        if (
            ContactPerson.trim().length > 100 ||
            !/^[A-Za-z\s.'-]+$/.test(ContactPerson.trim())
        ) {

            return res.status(400).json({
                status: "error",
                message: "Invalid ContactPerson. Maximum 100 characters allowed"
            });

        }


        // VALIDATE CONTACT NUMBER - EXACTLY 10 DIGITS

        if (
            typeof ContactNumber !== "string" ||
            !/^[0-9]{10}$/.test(ContactNumber.trim())
        ) {

            return res.status(400).json({
                status: "error",
                message: "ContactNumber must contain exactly 10 digits"
            });

        }


        // VALIDATE EMAIL

        if (
            typeof EmailId !== "string" ||
            !EmailId.trim()
        ) {

            return res.status(400).json({
                status: "error",
                message: "EmailId is required"
            });

        }


        if (
            EmailId.trim().length > 100 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EmailId.trim())
        ) {

            return res.status(400).json({
                status: "error",
                message: "Invalid EmailId"
            });

        }


        // VALIDATE ADDRESS

        if (
            typeof Address !== "string" ||
            !Address.trim()
        ) {

            return res.status(400).json({
                status: "error",
                message: "Address is required"
            });

        }


        // CHECK LOCATION TYPE EXISTS

        const locationType = await checkLocationTypeExists(
            Number(LocationTypeMasterId)
        );


        if (!locationType) {

            return res.status(404).json({
                status: "error",
                message: "LocationTypeMaster not found or inactive"
            });

        }


        // VALIDATE PARENT LOCATION

        let validParentLocationId = null;


        // ROOT LOCATION TYPE - PARENT MUST BE EMPTY

        if (locationType.ParentTypeId === null) {

            if (
                ParentLocationMasterId !== undefined &&
                ParentLocationMasterId !== null &&
                ParentLocationMasterId !== ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "ParentLocationMasterId must be empty for the root location type"
                });

            }

        }


        // CHILD LOCATION TYPE - PARENT IS REQUIRED

        else {

            if (!isValidId(ParentLocationMasterId)) {

                return res.status(400).json({
                    status: "error",
                    message: "ParentLocationMasterId is required"
                });

            }


            const validParent = await checkValidParentLocation(

                Number(ParentLocationMasterId),
                locationType.ParentTypeId,
                Number(CompanyMasterId)

            );


            if (!validParent) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid ParentLocationMasterId. Select an active parent location belonging to the correct location type and company"
                });

            }

            validParentLocationId = Number(ParentLocationMasterId);

        }


        // CHECK DUPLICATE CONTACT NUMBER

        const existingContact = await checkLocationContactExists(
            ContactNumber.trim()
        );


        if (existingContact.length > 0) {

            return res.status(409).json({
                status: "error",
                message: "ContactNumber already exists"

            });

        }


        // CHECK DUPLICATE EMAIL

        const existingEmail = await checkLocationEmailExists(
            EmailId.trim()
        );


        if (existingEmail.length > 0) {

            return res.status(409).json({
                status: "error",
                message: "EmailId already exists"
            });

        }


        // INSERT LOCATION MASTER

        const locationData = {

            CompanyMasterId: Number(CompanyMasterId),
            LocationTypeMasterId: Number(LocationTypeMasterId),
            ParentLocationMasterId: validParentLocationId,
            LocationName,
            ContactPerson,
            ContactNumber,
            EmailId,
            Address,
            CreatedByUserName

        };


        const newLocation = await addLocationMasters(locationData);

        return res.status(201).json({
            status: "success",
            message: "LocationMaster added successfully",
            data: newLocation

        });


    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: error.message

        });

    }

};
