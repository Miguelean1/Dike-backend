const { Router } = require('express');
const { body } = require('express-validator');
const { getCategories, createCategory } = require('../controllers/categories.controller');
const { authGuard } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');

const router = Router();

router.get('/', getCategories);

router.post('/',
  authGuard,
  validate([
    body('name').notEmpty().withMessage('Name is required'),
  ]),
  createCategory
);

module.exports = router;
