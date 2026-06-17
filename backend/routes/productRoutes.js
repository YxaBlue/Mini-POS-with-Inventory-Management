const express = require("express");
const router = express.Router();
const { validateProduct } = require("../middleware/validateProduct");
const {
    getProducts,
    getProductsByCategory,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
} = require("../controllers/productController");

router.get("/", getProducts);

router.get("/category/:category", getProductsByCategory);

router.get("/:id", getProductById);

router.post("/", validateProduct, addProduct);

router.put("/:id", validateProduct, updateProduct);

router.delete("/:id", deleteProduct);

module.exports = router;