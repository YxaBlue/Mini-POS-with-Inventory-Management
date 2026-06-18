exports.validateSale = (req, res, next) => {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
    }

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (!item.product_id || typeof item.product_id !== "number") {
            return res.status(400).json({
                message: `Item ${i + 1}: product_id must be a valid number.`,
            });
        }

        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
            return res.status(400).json({
                message: `Item ${i + 1}: quantity must be a positive integer.`,
            });
        }
    }

    next();
}