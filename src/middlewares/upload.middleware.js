const multer = require('multer');
const path = require('path');

// check type
const imageFilter = (req, file, cb) => {
    const allowedExts = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExts.test(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép định dạng ảnh (jpeg, jpg, png, gif)'), false);
    }
};

// check size
const limits = {
    fileSize: 5 * 1024 * 1024 // 5MB
}

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    fileFilter: imageFilter,
    limits
});

module.exports = upload;