exports.validateProduct = (req, res, next) => {
    const { 
        name,
        category,
        price,
        stock_quantity
    } = req.body;
    const errors = [];


    if (!name || typeof name !== "string" || name.trim().length === 0) {
        errors.push("Name is required");
    }
    if (name && name.length > 255) {
        errors.push("Name must not exceed 255 characters");
    }

    if (!category || typeof category !== "string" || category.trim().length === 0) {
        errors.push("Category is required");
    }

    if (price === undefined || price === null) {
        errors.push("Price is required");
    }
    if (isNaN(Number(price)) || Number(price) < 0) {
        errors.push("Price must be a non-negative number");
    }

    if (stock_quantity === undefined || stock_quantity === null) {
        errors.push("Stock quantity is required");
    }
    if (!Number.isInteger(Number(stock_quantity)) || Number(stock_quantity) < 0) {
        errors.push("Stock quantity must be a non-negative number");
    }


    if (errors.length > 0) {
        return res.status(400).json({
            message: "Validation failed",
            errors
        });
    }

    next();
}