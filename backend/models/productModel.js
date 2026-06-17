const db = require("../config/database");

const ProductModel = {
    getAll: (callback) => {
        db.query(
            "SELECT * FROM products WHERE is_active = TRUE",
            callback
        )
    },

    getById: (id, callback) => {
        db.query(
            "SELECT * FROM products WHERE id = ? AND is_active = TRUE",
            [id],
            callback
        )
    },

    getByCategory: (category, callback) => {
        db.query(
            "SELECT * FROM products WHERE LOWER(category) = LOWER(?) AND is_active = TRUE",
            [category],
            callback
        )
    },

    create: (data, callback) => {
        const {
            name,
            category,
            description,
            price,
            stock_quantity
        } = data;

        db.query(
            "INSERT INTO products (name, category, description, price, stock_quantity) VALUES (?, ?, ?, ?, ?)",
            [name, category, description || null, price, stock_quantity],
            callback
        )
    },

    update: (id, data, callback) => {
        const { 
            name,
            category,
            description,
            price,
            stock_quantity
        } = data;

        db.query(
            "UPDATE products SET name=?, category=?, description=?, price=?, stock_quantity=? WHERE id=?",
            [name, category, description || null, price, stock_quantity, id],
            callback
        );
    },

    delete: (id, callback) => {
        db.query(
            "UPDATE products SET is_active = FALSE WHERE id = ?",
            [id],
            callback
        )
    },
};

module.exports = ProductModel;