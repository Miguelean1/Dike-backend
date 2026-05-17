const { Router } = require('express');
const { getCategories, createCategory } = require('../controllers/categories.controller');
const { authGuard } = require('../middleware/auth.middleware');

const router = Router();

router.get('/', getCategories);
router.post('/', authGuard, createCategory);

module.exports = router;
