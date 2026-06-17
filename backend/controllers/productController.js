const ProductModel = require("../models/productModel");

// GET all active products
exports.getProducts = (req, res, next) => {
    ProductModel.getAll((err, result) => {
        if (err) return next(err);
        res.json(result);
    });
};

// GET products by category
exports.getProductsByCategory = (req, res, next) => {
    const { category } = req.params;

    ProductModel.getByCategory(category, (err, result) => {
        if (err) return next(err);
        if (result.length === 0) {
            return res.status(404).json({ message: "No products found in this category" });
        }
        res.json(result);
    });
};

// GET single product
exports.getProductById = (req, res, next) => {
    const { id } = req.params;

    ProductModel.getById(id, (err, result) => {
        if (err) return next(err);
        if (result.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(result[0]);
    });
};

// ADD product
exports.addProduct = (req, res, next) => {
    ProductModel.create(req.body, (err, result) => {
        if (err) return next(err);
        res.status(201).json({ message: "Product added successfully" });
    });
};

// UPDATE product
exports.updateProduct = (req, res, next) => {
    const { id } = req.params;

    ProductModel.update(id, req.body, (err, result) => {
        if (err) return next(err);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Product updated successfully" });
    });
};

// SOFT DELETE product
exports.deleteProduct = (req, res, next) => {
    const { id } = req.params;

    ProductModel.delete(id, (err, result) => {
        if (err) return next(err);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Product archived successfully" });
    });
};