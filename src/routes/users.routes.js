const { Router } = require('express');
const { body } = require('express-validator');
const { getUser, updateUser } = require('../controllers/users.controller');
const { authGuard } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');

const router = Router();

router.get('/:id', getUser);

router.put('/:id',
  authGuard,
  validate([
    body('username').optional().isLength({ min: 2 }).withMessage('Username must be at least 2 characters'),
    body('profile_picture').optional().isURL().withMessage('Profile picture must be a valid URL'),
  ]),
  updateUser
);

module.exports = router;
