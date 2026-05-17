const { Router } = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/auth.controller');
const validate = require('../middleware/validate');

const router = Router();

router.post('/register',
  validate([
    body('email').notEmpty().withMessage('Email is required').bail().isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required').bail().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('username').notEmpty().withMessage('Username is required'),
  ]),
  register
);

router.post('/login',
  validate([
    body('email').notEmpty().withMessage('Email is required').bail().isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  login
);

module.exports = router;
