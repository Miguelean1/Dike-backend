const { Router } = require('express');
const { body } = require('express-validator');
const { getUser, updateUser, getUserPosts } = require('../controllers/users.controller');
const { authGuard } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = Router();

router.get('/:id', getUser);
router.get('/:id/posts', getUserPosts);

router.put('/:id',
  authGuard,
  ...upload('avatars'),
  validate([
    body('username').optional().isLength({ min: 2 }).withMessage('Username must be at least 2 characters'),
  ]),
  updateUser
);

module.exports = router;
