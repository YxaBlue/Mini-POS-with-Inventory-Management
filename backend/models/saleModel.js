const db = require("../config/database");

/*
======================================================
======================================================
    SALE PAYLOAD 
    {
        "id": number,
        "receipt_number": string,
        "total_amount": number,
        "items": [
            {
                "product_id": number,
                "name": string,
                "quantity": number,
                "price": number,
                "subtotal": number
            }      
        ]
    }
======================================================
======================================================
*/


const SaleModel = {
    getAll: async () => {
        const [rows] = await db.query(
            `SELECT
                s.id,
                s.receipt_number,
                s.total_amount,
                s.transaction_date,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id',         sd.id,
                        'product_id', sd.product_id,
                        'name',       p.name,
                        'quantity',   sd.quantity,
                        'price',      sd.price,
                        'subtotal',   sd.subtotal
                    )
                ) AS items
            FROM sales s
            JOIN sales_details sd ON sd.sale_id = s.id
            JOIN products p       ON p.id = sd.product_id
            GROUP BY s.id
            ORDER BY s.transaction_date DESC
            `
        );
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query(
            `SELECT
                s.id,
                s.receipt_number,
                s.total_amount,
                s.transaction_date,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id',         sd.id,
                        'product_id', sd.product_id,
                        'name',       p.name,
                        'quantity',   sd.quantity,
                        'price',      sd.price,
                        'subtotal',   sd.subtotal
                    )
                ) AS items
            FROM sales s
            JOIN sales_details sd ON sd.sale_id = s.id
            JOIN products p       ON p.id = sd.product_id
            WHERE s.id = ?
            GROUP BY s.id`,
            [id]
        );
        return rows;
    },

    getProductForUpdate: async (conn, productId) => {
        const [rows] = await conn.query(
            `SELECT id, name, stock_quantity, price
            FROM products
            WHERE id = ? AND is_active = TRUE
            FOR UPDATE`,
            [productId]
        );
        return rows;
    },

    createSaleHeader: async (conn, receiptNumber, total) => {
        const [result] = await conn.query(
            `INSERT INTO sales (receipt_number, total_amount) VALUES (?, ?)`,
            [receiptNumber, total]
        );
        return result.insertId;
    },
    
    createSaleDetail: async (conn, saleId, item) => {
        const subtotal = item.price * item.quantity;
        await conn.query(
            `INSERT INTO sales_details (sale_id, product_id, quantity, price, subtotal)
            VALUES (?, ?, ?, ?, ?)`,
            [saleId, item.product_id, item.quantity, item.price, subtotal.toFixed(2)]
        );
    },

    decrementStock: async (conn, productId, quantity) => {
        await conn.query(
            `UPDATE products
            SET stock_quantity = stock_quantity - ?
            WHERE id = ?`,
            [quantity, productId]
        );
    },
};

module.exports = SaleModel;