const ProductModel = require("../models/productModel");

// GET all active products
exports.getProducts = async (req, res, next) => {
    try {
        const result = await ProductModel.getAll();
        res.json(result);
    } catch (err) {
        next(err);
    }
};

// GET products by category
exports.getProductsByCategory = async (req, res, next) => {
    try {
        const result = await ProductModel.getByCategory(req.params.category);
        if (result.length === 0) {
            return res.status(404).json({ message: "No products found in this category" });
        }
        res.json(result);
    } catch (err) {
        next(err);
    }
};

// GET single product
exports.getProductById = async (req, res, next) => {
    try {
        const result = await ProductModel.getById(req.params.id);
        if (result.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(result[0]);
    } catch (err) {
        next(err);
    }
};

// ADD product
exports.addProduct = async (req, res, next) => {
    try {
        await ProductModel.create(req.body);
        res.status(201).json({ message: "Product added successfully" });
    } catch (err) {
        next(err);
    }
};

// UPDATE product
exports.updateProduct = async (req, res, next) => {
    try {
        const result = await ProductModel.update(req.params.id, req.body);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Product updated successfully" });
    } catch (err) {
        next(err);
    }
};

// SOFT DELETE product
exports.deleteProduct = async (req, res, next) => {
    try {
        const result = await ProductModel.delete(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Product archived successfully" });
    } catch (err) {
        next(err);
    }
};