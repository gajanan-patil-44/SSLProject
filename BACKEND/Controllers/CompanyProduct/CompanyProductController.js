import {getAllCompanyProducts,getCompaniesForDropdown,getProductsForDropdown,addCompanyProduct,checkCompanyProductData,editCompanyProduct,deleteCompanyProduct,updateCompanyProductstatus} from "../../Models/CompanyProductModels.js";


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
                IsDisabled,
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
            // VALIDATE IS DISABLED
            // ==========================================

            if (typeof IsDisabled !== "boolean") {

                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be true or false"
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
                IsDisabled,
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



// ==========================================
// EDIT COMPANY PRODUCT CONTROLLER
// ==========================================

// ==========================================
// EDIT COMPANY PRODUCT CONTROLLER
// ==========================================

export const editCompanyProductController = async (req, res) => {

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
        // FLAG ID 3 - EDIT COMPANY PRODUCT
        // ==========================================

        if (parseInt(FlagId) === 3) {

            const {
                CompanyProductId,
                CompanyId,
                ProductId,
                UpdatedByUserName
            } = req.body;


            // ==========================================
            // VALIDATE COMPANY PRODUCT ID
            // ==========================================

            if (!CompanyProductId) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyProductId is required"
                });
            }


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
            // VALIDATE UPDATED USER
            // ==========================================

            if (!UpdatedByUserName) {

                return res.status(400).json({
                    status: "error",
                    message: "UpdatedByUserName is required"
                });
            }


            // ==========================================
            // CHECK COMPANY AND PRODUCT EXIST
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
            // UPDATE COMPANY PRODUCT
            // ==========================================

            const result = await editCompanyProduct({
                CompanyProductId,
                CompanyId,
                ProductId,
                UpdatedByUserName
            });


            // ==========================================
            // COMPANY PRODUCT NOT FOUND
            // ==========================================

            if (result === 0) {

                return res.status(404).json({
                    status: "error",
                    message: "Company product not found"
                });
            }


            // ==========================================
            // SUCCESS
            // ==========================================

            return res.status(200).json({
                status: "success",
                message: "Company product updated successfully",
                data: result
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
            "Error editing company product:",
            error
        );

        return res.status(500).json({
            status: "error",
            message: "Failed to edit company product",
            error: error.message
        });
    }
};

// ==========================================
// DELETE COMPANY PRODUCT CONTROLLER
// ==========================================


export const deleteCompanyProductController = async (req, res) => {

    const { FlagId, CompanyProductId } = req.body;

    try {

        // ==========================================
        // FLAG ID 1 - DELETE COMPANY PRODUCT
        // ==========================================

        if (parseInt(FlagId) === 1) {

            // Validate CompanyProductId
            if (!CompanyProductId) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyProductId is required"
                });
            }

            // Delete Company Product
            const result = await deleteCompanyProduct(
                CompanyProductId
            );

            // Company Product not found
            if (result === 0) {

                return res.status(404).json({
                    status: "error",
                    message: "Company product not found"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Company product deleted successfully",
                data: result
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
            "Error deleting company product:",
            error
        );

        return res.status(500).json({
            status: "error",
            message: "Failed to delete company product",
            error: error.message
        });
    }
};


export const updateCompanyProductstatusController = async (req, res) => {

    const {FlagId,CompanyProductId,IsDisabled} = req.body;

    try {

        if (parseInt(FlagId) === 1) {
            if (!CompanyProductId) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyProductId is required"
                });
            }
            if (typeof IsDisabled !== "boolean") {

                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be true or false"
                });
            }
            // ---------------------------------------------
            // UPDATE STATUS
            // ---------------------------------------------

            const result = await updateCompanyProductstatus(
                CompanyProductId,
                IsDisabled
            );

            if (result === 0) {

                return res.status(404).json({
                    status: "error",
                    message: "Company product not found"
                });
            }
            return res.status(200).json({
                status: "success",
                message: IsDisabled
                    ? "Company product disabled successfully"
                    : "Company product enabled successfully",
                data: result
            });
        }
        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        console.error("Error updating company product status:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to update company product status",
            error: error.message
        });
    }
};