import {
    getAllCompanyProducts,
    getCompaniesForDropdown,
    getProductsForDropdown,
    addCompanyProduct,
    checkCompanyProductData
} from "../../Models/CompanyProductModels.js";


// ==========================================
// GET ALL COMPANY PRODUCTS
// ==========================================

export const getCompanyProduct = async (req, res) => {

    const { FlagId } = req.body;

    try {

        // FlagId 1 - Get All Company Products
        if (parseInt(FlagId) === 1) {

            const rows = await getAllCompanyProducts();

            return res.status(200).json({
                status: "success",
                message: "Company products fetched successfully",
                data: rows
            });
        }

        // Invalid FlagId
        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        console.error(
            "Error fetching company products:",
            error
        );

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch company products",
            error: error.message
        });
    }
};


// ==========================================
// COMPANY PRODUCT ADD / DROPDOWN CONTROLLER
// ==========================================

export const companyProductController = async (req, res) => {

    const { FlagId } = req.body;

    try {

        // ==========================================
        // FLAG ID 1 - GET COMPANIES
        // ==========================================

        if (parseInt(FlagId) === 1) {

            const companies = await getCompaniesForDropdown();

            return res.status(200).json({
                status: "success",
                message: "Companies fetched successfully",
                data: companies
            });
        }


        // ==========================================
        // FLAG ID 2 - GET PRODUCTS
        // ==========================================

        if (parseInt(FlagId) === 2) {

            const products = await getProductsForDropdown();

            return res.status(200).json({
                status: "success",
                message: "Products fetched successfully",
                data: products
            });
        }


        // ==========================================
        // FLAG ID 3 - ADD COMPANY PRODUCT
        // ==========================================

        if (parseInt(FlagId) === 3) {

            const {
                CompanyId,
                ProductId,
                CreatedByUserName
            } = req.body;


            // ==========================================
            // VALIDATE COMPANY ID
            // ==========================================

            if (!CompanyId) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }


            // ==========================================
            // VALIDATE PRODUCT ID
            // ==========================================

            if (!ProductId) {

                return res.status(400).json({
                    status: "error",
                    message: "ProductId is required"
                });
            }


            // ==========================================
            // VALIDATE CREATED BY USER NAME
            // ==========================================

            if (!CreatedByUserName) {

                return res.status(400).json({
                    status: "error",
                    message: "CreatedByUserName is required"
                });
            }


            // ==========================================
            // CHECK COMPANY ID AND PRODUCT ID
            // ==========================================

            const companyProductData =
                await checkCompanyProductData(
                    CompanyId,
                    ProductId
                );


            if (companyProductData.length === 0) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid CompanyId or ProductId"
                });
            }


            // ==========================================
            // ADD COMPANY PRODUCT
            // ==========================================

            const companyProduct = await addCompanyProduct({
                CompanyId,
                ProductId,
                CreatedByUserName
            });


            return res.status(201).json({
                status: "success",
                message: "Company product added successfully",
                data: companyProduct
            });
        }


        // ==========================================
        // INVALID FLAG ID
        // ==========================================

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        console.error(
            "Error processing company product:",
            error
        );

        return res.status(500).json({
            status: "error",
            message: "Failed to process company product",
            error: error.message
        });
    }
};