
import {
    getGSTTypeDropdown,
    checkGSTTypeExists,
    checkCompanyExists,
    checkGSTRateExists,
    addGSTRate,
    getAllGSTRates,
    updateGSTRateStatus
} from "../../Models/GstRate/GstRate.js";

// ======================================================
// COMMON COMPANY ID VALIDATION
// CompanyId NULL = global access
// ======================================================
const validateCompanyId = async (CompanyId) => {
    if (
        CompanyId === undefined ||
        CompanyId === null ||
        CompanyId === ""
    ) {
        return {
            valid: true,
            CompanyId: null
        };
    }

    const id = Number(CompanyId);

    if (
        !Number.isInteger(id) ||
        id <= 0 ||
        id > 32767
    ) {
        return {
            valid: false,
            message: "Invalid CompanyId"
        };
    }

    const exists = await checkCompanyExists(id);

    if (!exists) {
        return {
            valid: false,
            message: "Company does not exist"
        };
    }

    return {
        valid: true,
        CompanyId: id
    };
};

// ======================================================
// FLAG ID 1 - GST TYPE DROPDOWN
// ======================================================
export const getGSTTypeDropdownController = async (req, res) => {
    try {
        const { FlagId } = req.body;

        if (Number(FlagId) !== 1) {
            return res.status(400).json({
                status: "error",
                message: "Invalid FlagId. Use FlagId 1."
            });
        }

        const data = await getGSTTypeDropdown();

        return res.status(200).json({
            status: "success",
            message: "GST Type dropdown fetched successfully",
            data
        });

    } catch (error) {
        console.error("GST Type Dropdown Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};

// ======================================================
// FLAG ID 2 - ADD GST RATE
// ======================================================
export const addGSTRateController = async (req, res) => {

    try {

        const {
            FlagId,
            CompanyId,
            GSTTypeId,
            GSTPercentage,
            CreatedByUserName
        } = req.body;

        if (Number(FlagId) !== 2) {
            return res.status(400).json({
                status: "error",
                message: "Invalid FlagId. Use FlagId 2."
            });
        }

        // ---------------------------------------------
        // VALIDATE LOGGED-IN COMPANY
        // ---------------------------------------------

        const loggedInCompanyId = req.user.CompanyId;

        if (loggedInCompanyId === undefined) {
            return res.status(403).json({
                status: "error",
                message: "Company access information is missing"
            });
        }

        const selectedCompanyId =
            loggedInCompanyId === null
                ? CompanyId
                : loggedInCompanyId;

        if (!selectedCompanyId) {
            return res.status(400).json({
                status: "error",
                message: "CompanyId is required"
            });
        }

        const companyValidation = await validateCompanyId(
            selectedCompanyId
        );

        if (!companyValidation.valid) {
            return res.status(400).json({
                status: "error",
                message: companyValidation.message
            });
        }

        // ---------------------------------------------
        // VALIDATE GST TYPE
        // ---------------------------------------------

        const typeId = Number(GSTTypeId);

        if (
            !Number.isInteger(typeId) ||
            typeId <= 0 ||
            typeId > 32767
        ) {
            return res.status(400).json({
                status: "error",
                message: "Valid GSTTypeId is required"
            });
        }

        const gstTypeExists = await checkGSTTypeExists(typeId);

        if (!gstTypeExists) {
            return res.status(400).json({
                status: "error",
                message: "GST Type does not exist or is disabled"
            });
        }

        // ---------------------------------------------
        // VALIDATE GST PERCENTAGE
        // ---------------------------------------------

        const percentageInput = String(GSTPercentage ?? "")
            .trim()
            .replace(/%\s*$/, "");

        if (!/^\d+(\.\d{1,2})?$/.test(percentageInput)) {
            return res.status(400).json({
                status: "error",
                message: "GST Percentage must be a valid number with maximum 2 decimal places"
            });
        }

        const percentage = Number(percentageInput);

        if (percentage < 0 || percentage > 100) {
            return res.status(400).json({
                status: "error",
                message: "GST Percentage must be between 0 and 100"
            });
        }

        // ---------------------------------------------
        // VALIDATE CREATED BY USER
        // ---------------------------------------------

        if (
            !CreatedByUserName ||
            !String(CreatedByUserName).trim()
        ) {
            return res.status(400).json({
                status: "error",
                message: "CreatedByUserName is required"
            });
        }

        // ---------------------------------------------
        // CHECK DUPLICATE GST RATE
        // ---------------------------------------------

        const duplicate = await checkGSTRateExists(
            companyValidation.CompanyId,
            typeId,
            percentage
        );

        if (duplicate) {
            return res.status(409).json({
                status: "error",
                message: "This GST Percentage already exists for this Company and GST Type"
            });
        }
        // ---------------------------------------------
        // ADD GST RATE
        // ---------------------------------------------

        const data = await addGSTRate({
            CompanyId: companyValidation.CompanyId,
            GSTTypeId: typeId,
            GSTPercentage: percentage,
            CreatedByUserName: String(CreatedByUserName).trim()
        });

        return res.status(201).json({
            status: "success",
            message: "GST Rate added successfully",
            data
        });

    } catch (error) {


        return res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};
// ======================================================
// FLAG ID 3 - VIEW GST RATES
// ======================================================
export const getAllGSTRatesController = async (req, res) => {

    try {

        const { FlagId, CompanyId } = req.body;

        if (Number(FlagId) !== 3) {
            return res.status(400).json({
                status: "error",
                message: "Invalid FlagId. Use FlagId 3."
            });
        }

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

        if (selectedCompanyId !== null) {

            const companyValidation = await validateCompanyId(
                selectedCompanyId
            );

            if (!companyValidation.valid) {
                return res.status(400).json({
                    status: "error",
                    message: companyValidation.message
                });
            }
        }

        const data = await getAllGSTRates(selectedCompanyId);

        return res.status(200).json({
            status: "success",
            message: "GST Rates fetched successfully",
            data
        });

    } catch (error) {

        console.error("Get GST Rates Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};

// ======================================================
// FLAG ID 4 - ENABLE / DISABLE GST RATE
// ======================================================
export const updateGSTRateStatusController = async (req, res) => {
    try {
        const {
            FlagId,
            CompanyId,
            GSTRateId,
            IsDisabled,
            UpdatedByUserName
        } = req.body;

        if (Number(FlagId) !== 4) {
            return res.status(400).json({
                status: "error",
                message: "Invalid FlagId. Use FlagId 4."
            });
        }

        const companyValidation = await validateCompanyId(CompanyId);

        if (!companyValidation.valid) {
            return res.status(400).json({
                status: "error",
                message: companyValidation.message
            });
        }

        const rateId = Number(GSTRateId);

        if (
            !Number.isInteger(rateId) ||
            rateId <= 0 ||
            rateId > 32767
        ) {
            return res.status(400).json({
                status: "error",
                message: "Valid GSTRateId is required"
            });
        }

        if (typeof IsDisabled !== "boolean") {
            return res.status(400).json({
                status: "error",
                message: "IsDisabled must be true or false"
            });
        }

        if (
            !UpdatedByUserName ||
            !String(UpdatedByUserName).trim()
        ) {
            return res.status(400).json({
                status: "error",
                message: "UpdatedByUserName is required"
            });
        }

        const data = await updateGSTRateStatus(
            rateId,
            companyValidation.CompanyId,
            IsDisabled,
            String(UpdatedByUserName).trim()
        );

        if (!data) {
            return res.status(404).json({
                status: "error",
                message: "GST Rate not found for the selected company"
            });
        }

        return res.status(200).json({
            status: "success",
            message: IsDisabled
                ? "GST Rate disabled successfully"
                : "GST Rate enabled successfully",
            data
        });

    } catch (error) {
        console.error("Update GST Rate Status Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};
