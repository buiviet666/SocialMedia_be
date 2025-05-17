const { check } = require('express-validator');
const validator = require('validator');
const validationResult = require('../middlewares/validate.middleware');

exports.register = [
  check('userName')
    .notEmpty().withMessage('Username is require')
    .isLength({ min: 6, max: 30 }).withMessage('Username must be 6-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must contain only letters, numbers and underscores'),

  check('password')
    .notEmpty().withMessage('password is require')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/).withMessage('Password must contain letters and numbers, minimum 6 characters'),

  check('emailAddress')
    .notEmpty().withMessage('emailAddress is require')
    .isEmail().withMessage('Invalid emailAddress')
    .normalizeEmail(),

  check('phoneNumber')
    .notEmpty().withMessage('phoneNumber is require')
    .trim()
    .custom(v => validator.isMobilePhone(v, 'vi-VN'))
    .withMessage('Invalid phoneNumber'),

  validationResult
];

exports.login = [
  check('identifier')
    .notEmpty().withMessage('Username/Email is require'),

  check('password')
    .notEmpty().withMessage('password is require'),

  validationResult
];

exports.updateProfile = [
  check('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'unspecified'])
    .withMessage('Giới tính không hợp lệ'),

  check('dateOfBirth')
    .optional()
    .isDate()
    .withMessage('Ngày sinh không hợp lệ'),

  check('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio không quá 500 ký tự'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];