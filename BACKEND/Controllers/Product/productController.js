import {
    getAllProducts,
    checkProductExists,
    addProduct,
    updateProducts,
    checkProductExistsForUpdate,
    toggleProductStatuses,
    deleteProducts
} from "../../Models/ProductModels.js";


// ==========================================
// GET ALL ACTIVE PRODUCTS
// ==========================================

export const getProduct = async (req, res) => {
    const { flagId } = req.body;
    try {
        if (parseInt(flagId) === 1) {
            const rows = await getAllProducts();

            return res.status(200).json({
                status: "success",
                message: "Products fetched successfully",
                data: rows
            });

        } else {
            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            })
        }

    } catch (error) {

        console.error("Error fetching products:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch products",
            error: error.message
        });
    }
};


// ==========================================
// ADD PRODUCT
// ==========================================

export const addProducts = async (req, res) => {

    const { flagId } = req.body;

    try {
        // flagId 2 = Add Product
        if (parseInt(flagId) === 2) {

            const productData = req.body;
            // Check Product Name and Product Code
            const existingProduct = await checkProductExists(
                productData.ProductName,
                productData.ProductCode
            );

            if (existingProduct.length > 0) {

                const product = existingProduct[0];

                // Product Name exists
                if (product.ProductName === productData.ProductName) {

                    return res.status(409).json({
                        status: "error",
                        message: "Product name already exists"
                    });
                }

                // Product Code exists
                if (product.ProductCode === productData.ProductCode) {

                    return res.status(409).json({
                        status: "error",
                        message: "Product code already exists"
                    });
                }
            }

            // Add Product
            const product = await addProduct(productData);

            return res.status(201).json({
                status: "success",
                message: "Product added successfully"
            });
        }

        // Invalid flagId
        return res.status(400).json({
            status: "error",
            message: "Invalid flagId"
        });

    } catch (error) {

        console.error("Error adding product:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to add product",
            error: error.message
        });
    }
};


// ==========================================
// UPDATE PRODUCT
// ==========================================

export const updateProduct = async (req, res) => {

    const { flagId } = req.body;

    try {

        // flagId 3 = Update Product
        if (parseInt(flagId) === 3) {

            const productData = req.body;
            // Check Product Name and Product Code
            // Exclude the current ProductId
            const existingProducts = await checkProductExistsForUpdate(
                productData.ProductName,
                productData.ProductCode,
                productData.ProductId
            );

            // Check duplicate Product Name / Product Code
            for (const product of existingProducts) {

                // Product Name exists
                if (product.ProductName === productData.ProductName) {

                    return res.status(409).json({
                        status: "error",
                        message: "Product name already exists"
                    });
                }

                // Product Code exists
                if (product.ProductCode === productData.ProductCode) {

                    return res.status(409).json({
                        status: "error",
                        message: "Product code already exists"
                    });
                }
            }

            // Update Product
            const product = await updateProducts(productData);

            return res.status(200).json({
                status: "success",
                message: "Product updated successfully",
                data: product
            });
        }

        // Invalid flagId
        return res.status(400).json({
            status: "error",
            message: "Invalid flagId"
        });

    } catch (error) {

        console.error("Error updating product:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to update product",
            error: error.message
        });
    }
};





// ==========================================
// TOGGLE PRODUCT STATUS
// ==========================================

export const toggleProductStatus = async (req, res) => {

    const { flagId } = req.body;

    try {

        // flagId 4 = Toggle Product Status
        if (parseInt(flagId) === 4) {

            const productData = req.body;

            console.log("Received toggle product data:", productData);

            const product = await toggleProductStatuses(productData);

            // Product does not exist
            if (!product) {

                return res.status(404).json({
                    status: "error",
                    message: "Product not found"
                });
            }

            // Product status successfully toggled
            return res.status(200).json({
                status: "success",
                message: "Product status updated successfully"
            });
        }

        // Invalid flagId
        return res.status(400).json({
            status: "error",
            message: "Invalid flagId"
        });

    } catch (error) {

        console.error("Error toggling product status:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to update product status",
            error: error.message
        });
    }
};


// ==========================================
// DELETE / DISABLE PRODUCT
// ==========================================

export const deleteProduct = async (req, res) => {
    const { flagId } = req.body;
    try {
        if (parseInt(flagId) == 5) {
            const productData = req.body;

            console.log("Received delete product data:", productData);

            const product = await deleteProducts(productData);

            return res.status(200).json({
                status: "success",
                message: "Product Deleted successfully",
                data: product
            });
        } else {
            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            })
        }

    } catch (error) {

        console.error("Error disabling product:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to disable product",
            error: error.message
        });
    }
};