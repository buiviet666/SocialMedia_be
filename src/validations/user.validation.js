const { check, validationResult } = require('express-validator');
const validator = require('validator');

exports.register = [
  check('userName')
    .notEmpty().withMessage('Username là bắt buộc')
    .isLength({ min: 6, max: 30 }).withMessage('Username phải từ 3-30 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username chỉ chứa chữ cái, số và dấu gạch dưới'),

  check('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),

  check('emailAddress')
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ'),

  check('phoneNumber')
    .optional()
    .custom(v => validator.isMobilePhone(v, 'any', { strictMode: false }))
    .withMessage('Số điện thoại không hợp lệ'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.login = [
  check('identifier').notEmpty().withMessage('Username/Email là bắt buộc'),
  check('password').notEmpty().withMessage('Mật khẩu là bắt buộc'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
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