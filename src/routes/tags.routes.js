const { Router } = require('express');
const { getTags, createTag } = require('../controllers/tags.controller');
const { authGuard } = require('../middleware/auth.middleware');

const router = Router();

router.get('/', getTags);
router.post('/', authGuard, createTag);

module.exports = router;
