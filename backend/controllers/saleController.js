const db = require("../config/database");
const SaleModel = require("../models/saleModel");

exports.getAllSales = async (req, res, next) => {
    try {
        const results = await SaleModel.getAll();
        res.json(results);
    } catch (err) {
        next(err);
    }
};

exports.getSaleById = async (req, res, next) => {
    try {
        const results = await SaleModel.getById(req.params.id);
        if (!results.length) return res.status(404).json({ message: "Sale not found." });
        res.json(results[0]);
    } catch (err) {
        next(err);
    }
};

exports.createSale = async (req, res, next) => {
    const { items } = req.body;
    const conn = await db.getConnection();

    await conn.beginTransaction();

    try {
        const products = await checkStock(conn, items);

        const enrichedItems = items.map((item, i) => ({
            ...item,
            price: products[i].price,
        }));

        const total = enrichedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const receiptNumber = generateReceipt();

        const saleId = await insertSaleHeader(conn, receiptNumber, total);
        await insertSaleDetails(conn, saleId, enrichedItems);

        await conn.commit();
        res.status(201).json({
            message:        "Sale completed.",
            id:             saleId,
            receipt_number: receiptNumber,
            total_amount:   parseFloat(total.toFixed(2)),
        });
    } catch (err) {
        try { await conn.rollback(); }
        catch (rollbackErr) { console.error("Rollback failed:", rollbackErr); }
        
        if (err.status) {
            return res.status(err.status).json({ message: err.message });
        }
        next(err);
    } finally {
        conn.release();
    }
};

function generateReceipt() {
    // Format: RCP-YYYYMMDD-HHMMSS-RAND
    const now      = new Date();
    const pad      = (n) => String(n).padStart(2, "0");
    const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const rand     = String(Math.floor(Math.random() * 9000) + 1000);
    
    return `RCP-${datePart}-${timePart}-${rand}`;
}

async function checkStock(conn, items) {
    const products = await Promise.all(
        items.map(item => SaleModel.getProductForUpdate(conn, item.product_id))
    );

    products.forEach((rows, i) => {
        const product = rows[0];
        if (!product) throw { status: 404, message: `Product #${items[i].product_id} not found or inactive.` };
        if (product.stock_quantity < items[i].quantity) throw { status: 400, message: `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}.` };
    });

    return products.map(rows => rows[0]);
}

async function insertSaleHeader(conn, receiptNumber, total) {
    return SaleModel.createSaleHeader(conn, receiptNumber, total.toFixed(2));
}

async function insertSaleDetails(conn, saleId, items) {
    for (const item of items) {
        await SaleModel.createSaleDetail(conn, saleId, item);
        await SaleModel.decrementStock(conn, item.product_id, item.quantity);
    }
}