exports.errorHandler = (err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] ${err.stack}`);

    res.status(err.status || 500).json({
        message: err.message || "An internal server error occurred"
    });
}