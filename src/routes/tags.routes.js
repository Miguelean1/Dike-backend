const { Router } = require('express');
const { body } = require('express-validator');
const { getTags, createTag } = require('../controllers/tags.controller');
const { authGuard } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');

const router = Router();

router.get('/', getTags);

router.post('/',
  authGuard,
  validate([
    body('name').notEmpty().withMessage('Name is required'),
  ]),
  createTag
);

module.exports = router;
