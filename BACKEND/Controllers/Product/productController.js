import {
    getAllProducts,
    addProduct,
    updateProducts,
    deleteProducts
} from "../../Models/ProductModels.js";


// ==========================================
// GET ALL ACTIVE PRODUCTS
// ==========================================

export const getProduct = async (req, res) => {
    try {

        const rows = await getAllProducts();

        return res.status(200).json({
            status: "success",
            message: "Products fetched successfully",
            data: rows
        });

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
    try {

        const productData = req.body;

        console.log("Received product data:", productData);

        const product = await addProduct(productData);

        return res.status(201).json({
            status: "success",
            message: "Product added successfully",
            data: product
        });

    } catch (error) {

        console.error("Error adding product:", error);

        // PostgreSQL unique constraint violation
        if (error.code === "23505") {

            return res.status(409).json({
                status: "error",
                message: "Product code or Product name already exists"
            });
        }

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
    try {

        const productData = req.body;

        console.log("Received update product data:", productData);

        const product = await updateProducts(productData);

        return res.status(200).json({
            status: "success",
            message: "Product updated successfully",
            data: product
        });

    } catch (error) {

        console.error("Error updating product:", error);

        // PostgreSQL unique constraint violation
        if (error.code === "23505") {

            return res.status(409).json({
                status: "error",
                message: "Product code or Product name already exists"
            });
        }

        return res.status(500).json({
            status: "error",
            message: "Failed to update product",
            error: error.message
        });
    }
};


// ==========================================
// DELETE / DISABLE PRODUCT
// ==========================================

export const deleteProduct = async (req, res) => {
    try {

        const productData = req.body;

        console.log("Received delete product data:", productData);

        const product = await deleteProducts(productData);

        return res.status(200).json({
            status: "success",
            message: "Product disabled successfully",
            data: product
        });

    } catch (error) {

        console.error("Error disabling product:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to disable product",
            error: error.message
        });
    }
};