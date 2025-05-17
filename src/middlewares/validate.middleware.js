const { validationResult } = require("express-validator")

module.exports = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
            field: err.path,
            message: err.msg
        }));
        return res.status(400).json({
            errorMessages
        });
    }
    next();
};