const express = require("express");
const router  = express.Router();

const { getAllSales, getSaleById, createSale } = require("../controllers/saleController");
const { validateSale } = require("../middleware/validateSale");

router.get("/", getAllSales);
router.get("/:id", getSaleById);
router.post("/", validateSale, createSale);

module.exports = router;