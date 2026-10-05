import {
    getAllCompanies,
    addCompany,
    checkCompanyExists,
    checkCompanyExistsForUpdate,
    updateCompanies,
    toggleCompanyStatuses,
    deleteCompanies
} from "../../Models/CompanyModels.js";



// GET ALL ACTIVE COMPANIES

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

            })
        }

    } catch (error) {

        // console.error("Error fetching companies:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch companies",
            error: error.message
        });
    }
};


// ADD COMPANY

export const addCompanies = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }


        // flagId 2 = Add Company
        if (parseInt(flagId) === 2) {
            const companyData = req.body;

            // Check Company Name and Company Code
            const existingCompany = await checkCompanyExists(
                companyData.CompanyName,
                companyData.CompanyCode
            );

            if (existingCompany.length > 0) {

                const company = existingCompany[0];

                //Both Company Name and Company Code exist
                if (
                    company.CompanyName === companyData.CompanyName &&
                    company.CompanyCode === companyData.CompanyCode
                ) {
                    return res.status(409).json({
                        status: "error",
                        message: "Company name and company code already exist"
                    });
                }

                // Company Name exists
                if (company.CompanyName === companyData.CompanyName) {

                    return res.status(409).json({
                        status: "error",
                        message: "Company name already exists"
                    });
                }

                // Company Code exists
                if (company.CompanyCode === companyData.CompanyCode) {

                    return res.status(409).json({
                        status: "error",
                        message: "Company code already exists"
                    });
                }


            }

            // Add Company
            const company = await addCompany(companyData);

            return res.status(201).json({
                status: "success",
                message: "Company added successfully"
            });
        }

        // Invalid flagId
        return res.status(400).json({
            status: "error",
            message: "Invalid flagId"
        });

    } catch (error) {

        // console.error("Error adding company:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to add company",
            error: error.message
        });
    }
};


// UPDATE COMPANY

export const updateCompany = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        // flagId 3 = Update Company
        if (parseInt(flagId) === 3) {

            const companyData = req.body;

            // Check whether Company Name and Company Code already exist
            const existingCompanies = await checkCompanyExistsForUpdate(
                companyData.CompanyName,
                companyData.CompanyCode
            );

            // Check duplicate Company Name / Company Code
            for (const company of existingCompanies) {

                // Both Company Name and Company Code exist
                if (
                    company.CompanyName === companyData.CompanyName &&
                    company.CompanyCode === companyData.CompanyCode
                ) {

                    return res.status(409).json({
                        status: "error",
                        message: "Company name and company code already exist"
                    });
                }

                // Company Name exists
                if (
                    company.CompanyName === companyData.CompanyName
                ) {

                    return res.status(409).json({
                        status: "error",
                        message: "Company name already exists"
                    });
                }

                // Company Code exists
                if (
                    company.CompanyCode === companyData.CompanyCode
                ) {

                    return res.status(409).json({
                        status: "error",
                        message: "Company code already exists"
                    });
                }
            }

            // Only updateCompanies() updates the database
            const company = await updateCompanies(companyData);

            return res.status(200).json({
                status: "success",
                message: "Company updated successfully",
                data: company
            });
        }

        // Invalid flagId
        return res.status(400).json({
            status: "error",
            message: "Invalid flagId"
        });

    } catch (error) {

        // console.error("Error updating company:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to update company",
            error: error.message
        });
    }
};


// TOGGLE COMPANY STATUS

export const toggleCompanyStatus = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        // flagId 4 = Toggle Company Status
        if (parseInt(flagId) === 4) {

            const companyData = req.body;
            const company = await toggleCompanyStatuses(companyData);

            // Company does not exist
            if (!company) {

                return res.status(404).json({
                    status: "error",
                    message: "Company not found"
                });
            }

            // Company status successfully toggled
            return res.status(200).json({
                status: "success",
                message: "Company status updated successfully"

            });
        }

        // Invalid flagId
        return res.status(400).json({
            status: "error",
            message: "Invalid flagId"
        });

    } catch (error) {

        // console.error("Error toggling company status:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to update company status",
            error: error.message
        });
    }
};

// DELETE / DISABLE COMPANY

export const deleteCompany = async (req, res) => {
    const { flagId } = req.body;
    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }


        if (parseInt(flagId) == 5) {
            const companyData = req.body;

            console.log("Received delete company data:", companyData);

            const company = await deleteCompanies(companyData);

            return res.status(200).json({
                status: "success",
                message: "Company disabled successfully",
                data: company
            });

        } else {
            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            })
        }

    } catch (error) {

        // console.error("Error disabling company:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to disable company",
            error: error.message
        });
    }
};