import {
    getAllProducts,
    checkProductExists,
    addProduct,
    updateProducts,
    checkProductExistsForUpdate,
    toggleProductStatuses,
    deleteProducts
} from "../../Models/ProductModels.js";


// GET ALL ACTIVE PRODUCTS

export const getProduct = async (req, res) => {
    
    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

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

        // console.error("Error fetching products:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch products",
            error: error.message
        });
    }
};


// ADD PRODUCT


export const addProducts = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        // flagId 2 = Add Product
        if (parseInt(flagId) === 2) {

            const productData = req.body;

            // ---------------------------------------------
            // VALIDATE PRODUCT NAME
            // Alphabetic characters and spaces only
            // Maximum length: 30 characters
            // ---------------------------------------------
            if (
                typeof productData.ProductName !== "string" ||
                !productData.ProductName.trim()
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "ProductName is required"
                });
            }

            productData.ProductName = productData.ProductName.trim();

            const productNameRegex = /^[A-Za-z ]{1,30}$/;

            if (!productNameRegex.test(productData.ProductName)) {
                return res.status(400).json({
                    status: "error",
                    message:
                        "ProductName must contain only alphabetic characters and spaces, with a maximum length of 30 characters."
                });
            }

            // ---------------------------------------------
            // VALIDATE PRODUCT CODE
            // Alphanumeric characters only
            // Maximum length: 15 characters
            // ---------------------------------------------
            if (
                typeof productData.ProductCode !== "string" ||
                !productData.ProductCode.trim()
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "ProductCode is required"
                });
            }

            productData.ProductCode = productData.ProductCode.trim();

            const productCodeRegex = /^[A-Za-z0-9]{1,15}$/;

            if (!productCodeRegex.test(productData.ProductCode)) {
                return res.status(400).json({
                    status: "error",
                    message:
                        "ProductCode must contain only alphanumeric characters, with a maximum length of 15 characters."
                });
            }

            // ---------------------------------------------
            // VALIDATE PRODUCT DESCRIPTION
            // Optional: NULL or empty string allowed
            // Maximum length: 250 characters
            // ---------------------------------------------
            if (
                productData.ProductDescription !== undefined &&
                productData.ProductDescription !== null
            ) {
                if (typeof productData.ProductDescription !== "string") {
                    return res.status(400).json({
                        status: "error",
                        message:
                            "ProductDescription must be a string or NULL."
                    });
                }

                if (productData.ProductDescription.length > 250) {
                    return res.status(400).json({
                        status: "error",
                        message:
                            "ProductDescription must not exceed 250 characters."
                    });
                }
            }

            // ---------------------------------------------
            // CHECK DUPLICATE PRODUCT NAME AND CODE
            // ---------------------------------------------
            const existingProduct = await checkProductExists(
                productData.ProductName,
                productData.ProductCode
            );

            if (existingProduct.length > 0) {

                const productNameExists = existingProduct.some(
                    product =>
                        product.ProductName?.toLowerCase() ===
                        productData.ProductName.toLowerCase()
                );

                const productCodeExists = existingProduct.some(
                    product =>
                        product.ProductCode?.toLowerCase() ===
                        productData.ProductCode.toLowerCase()
                );

                if (productNameExists && productCodeExists) {
                    return res.status(409).json({
                        status: "error",
                        message:
                            "Product name and product code already exist"
                    });
                }

                if (productNameExists) {
                    return res.status(409).json({
                        status: "error",
                        message: "Product name already exists"
                    });
                }

                if (productCodeExists) {
                    return res.status(409).json({
                        status: "error",
                        message: "Product code already exists"
                    });
                }
            }

            // ---------------------------------------------
            // ADD PRODUCT
            // ---------------------------------------------
            await addProduct(productData);

            return res.status(201).json({
                status: "success",
                message: "Product added successfully"
            });
        }

        // ---------------------------------------------
        // INVALID FLAG ID
        // ---------------------------------------------
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


// UPDATE PRODUCT


export const updateProduct = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        // flagId 3 = Update Product
        if (parseInt(flagId) === 3) {

            const productData = req.body;

            // ---------------------------------------------
            // VALIDATE PRODUCT ID
            // ---------------------------------------------
            if (!productData.ProductId) {
                return res.status(400).json({
                    status: "error",
                    message: "ProductId is required"
                });
            }

            // ---------------------------------------------
            // VALIDATE PRODUCT NAME
            // Alphabetic characters and spaces only
            // Maximum length: 30 characters
            // ---------------------------------------------
            if (
                typeof productData.ProductName !== "string" ||
                !productData.ProductName.trim()
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "ProductName is required"
                });
            }

            productData.ProductName = productData.ProductName.trim();

            const productNameRegex = /^[A-Za-z ]{1,30}$/;

            if (!productNameRegex.test(productData.ProductName)) {
                return res.status(400).json({
                    status: "error",
                    message:
                        "ProductName must contain only alphabetic characters and spaces, with a maximum length of 30 characters."
                });
            }

            // ---------------------------------------------
            // VALIDATE PRODUCT CODE
            // Alphanumeric characters only
            // Maximum length: 15 characters
            // ---------------------------------------------
            if (
                typeof productData.ProductCode !== "string" ||
                !productData.ProductCode.trim()
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "ProductCode is required"
                });
            }

            productData.ProductCode = productData.ProductCode.trim();

            const productCodeRegex = /^[A-Za-z0-9]{1,15}$/;

            if (!productCodeRegex.test(productData.ProductCode)) {
                return res.status(400).json({
                    status: "error",
                    message:
                        "ProductCode must contain only alphanumeric characters, with a maximum length of 15 characters."
                });
            }

            // ---------------------------------------------
            // VALIDATE PRODUCT DESCRIPTION
            // Optional: NULL or empty string allowed
            // Maximum length: 250 characters
            // ---------------------------------------------
            if (
                productData.ProductDescription !== undefined &&
                productData.ProductDescription !== null
            ) {

                if (typeof productData.ProductDescription !== "string") {
                    return res.status(400).json({
                        status: "error",
                        message:
                            "ProductDescription must be a string or NULL."
                    });
                }

                if (productData.ProductDescription.length > 250) {
                    return res.status(400).json({
                        status: "error",
                        message:
                            "ProductDescription must not exceed 250 characters."
                    });
                }
            }

            // ---------------------------------------------
            // CHECK DUPLICATE PRODUCT NAME AND CODE
            // Exclude current ProductId in the model query
            // ---------------------------------------------
            const existingProducts = await checkProductExistsForUpdate(
                productData.ProductName,
                productData.ProductCode,
                productData.ProductId
            );

            const productNameExists = existingProducts.some(
                product =>
                    product.ProductName?.toLowerCase() ===
                    productData.ProductName.toLowerCase()
            );

            const productCodeExists = existingProducts.some(
                product =>
                    product.ProductCode?.toLowerCase() ===
                    productData.ProductCode.toLowerCase()
            );

            if (productNameExists && productCodeExists) {
                return res.status(409).json({
                    status: "error",
                    message:
                        "Product name and product code already exist"
                });
            }

            if (productNameExists) {
                return res.status(409).json({
                    status: "error",
                    message: "Product name already exists"
                });
            }

            if (productCodeExists) {
                return res.status(409).json({
                    status: "error",
                    message: "Product code already exists"
                });
            }

            // ---------------------------------------------
            // UPDATE PRODUCT
            // ---------------------------------------------
            const product = await updateProducts(productData);

            if (product === 0 || product === null) {
                return res.status(404).json({
                    status: "error",
                    message: "Product not found"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Product updated successfully",
                data: product
            });
        }

        // ---------------------------------------------
        // INVALID FLAG ID
        // ---------------------------------------------
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



// TOGGLE PRODUCT STATUS

export const toggleProductStatus = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }


        // flagId 4 = Toggle Product Status
        if (parseInt(flagId) === 4) {

            const productData = req.body;

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

        // console.error("Error toggling product status:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to update product status",
            error: error.message
        });
    }
};



// DELETE / DISABLE PRODUCT

export const deleteProduct = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }



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

        // console.error("Error disabling product:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to disable product",
            error: error.message
        });
    }
};