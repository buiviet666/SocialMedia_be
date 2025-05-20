const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        statusCode: statusCode,
        message: err.message || "error server!"
    });
};

const notFound = (req, res, next) => {
    res.status(404).json({
        statusCode: 404,
        message: "not found"
    });
};

module.exports = {
    errorHandler,
    notFound
}