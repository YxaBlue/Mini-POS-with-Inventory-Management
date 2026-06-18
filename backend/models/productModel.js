const db = require("../config/database");

/*
======================================================
    PRODUCT PAYLOAD 
    {
        "id": number,
        "name": string,
        "category": string,
        "description": string,
        "price": number,
        "stock_quantity": number,
        "is_active": number,
        "created_at": timestamp,
        "updated_at": timestamp,
    }
======================================================
*/

const ProductModel = {
    getAll: async () => {
        const [rows] = await db.query(
            `SELECT * 
             FROM products 
             WHERE is_active = TRUE`
        );
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query(
            `SELECT *
             FROM products
             WHERE id = ? AND is_active = TRUE`,
            [id]
        );
        return rows;
    },

    getByCategory: async (category) => {
        const [rows] = await db.query(
            `SELECT *
             FROM products
             WHERE LOWER(category) = LOWER(?) AND is_active = TRUE`,
            [category]
        );
        return rows;
    },

    create: async (data) => {
        const { name, category, description, price, stock_quantity } = data;
        const [result] = await db.query(
            `INSERT INTO products (name, category, description, price, stock_quantity)
             VALUES (?, ?, ?, ?, ?)`,
            [name, category, description || null, price, stock_quantity]
        );
        return result;
    },

    update: async (id, data) => {
        const { name, category, description, price, stock_quantity } = data;
        const [result] = await db.query(
            `UPDATE products
             SET name=?, category=?, description=?, price=?, stock_quantity=?
             WHERE id=?`,
            [name, category, description || null, price, stock_quantity, id]
        );
        return result;
    },

    delete: async (id) => {
        const [result] = await db.query(
            `UPDATE products
             SET is_active = FALSE
             WHERE id = ?`,
            [id]
        );
        return result;
    },
};

module.exports = ProductModel;