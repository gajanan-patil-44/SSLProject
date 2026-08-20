import {
    getAllCompanies,
    addCompany,
    updateCompanies,
    deleteCompanies
} from "../../Models/CompanyModels.js";


// ==========================================
// GET ALL ACTIVE COMPANIES
// ==========================================

export const getCompany = async (req, res) => {
    try {

        const rows = await getAllCompanies();

        return res.status(200).json({
            status: "success",
            message: "Companies fetched successfully",
            data: rows
        });

    } catch (error) {

        console.error("Error fetching companies:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch companies",
            error: error.message
        });
    }
};


// ==========================================
// ADD COMPANY
// ==========================================

export const addCompanies = async (req, res) => {
    try {

        const companyData = req.body;

        console.log("Received company data:", companyData);

        const company = await addCompany(companyData);

        return res.status(201).json({
            status: "success",
            message: "Company added successfully",
            data: company
        });

    } catch (error) {

        console.error("Error adding company:", error);

        // PostgreSQL unique constraint violation
        if (error.code === "23505") {

            return res.status(409).json({
                status: "error",
                message: "Company code or Company name already exists"
            });
        }

        return res.status(500).json({
            status: "error",
            message: "Failed to add company",
            error: error.message
        });
    }
};


// ==========================================
// UPDATE COMPANY
// ==========================================

export const updateCompany = async (req, res) => {
    try {

        const companyData = req.body;

        console.log("Received update company data:", companyData);

        const company = await updateCompanies(companyData);

        return res.status(200).json({
            status: "success",
            message: "Company updated successfully",
            data: company
        });

    } catch (error) {

        console.error("Error updating company:", error);

        // PostgreSQL unique constraint violation
        if (error.code === "23505") {

            return res.status(409).json({
                status: "error",
                message: "Company code or Company name already exists"
            });
        }

        return res.status(500).json({
            status: "error",
            message: "Failed to update company",
            error: error.message
        });
    }
};


// ==========================================
// DELETE / DISABLE COMPANY
// ==========================================

export const deleteCompany = async (req, res) => {
    try {

        const companyData = req.body;

        console.log("Received delete company data:", companyData);

        const company = await deleteCompanies(companyData);

        return res.status(200).json({
            status: "success",
            message: "Company disabled successfully",
            data: company
        });

    } catch (error) {

        console.error("Error disabling company:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to disable company",
            error: error.message
        });
    }
};