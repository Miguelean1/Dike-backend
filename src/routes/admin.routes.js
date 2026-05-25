'use strict';

const { Router } = require('express');
const { body } = require('express-validator');
const { authGuard, adminGuard } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');

const { getAllUsers, updateUser, deleteUser } = require('../controllers/admin.users.controller');
const { getAllPosts, updatePost, deletePost } = require('../controllers/admin.posts.controller');

const router = Router();

router.use(authGuard, adminGuard);


router.get('/users', getAllUsers);
router.put('/users/:id',
  validate([
    body('role').optional().isIn(['visitor', 'user', 'admin']).withMessage('Invalid role'),
    body('reputation').optional().isInt({ min: 0 }).withMessage('Reputation must be a positive integer'),
  ]),
  updateUser
);
router.delete('/users/:id', deleteUser);


router.get('/posts', getAllPosts);
router.put('/posts/:id',
  validate([
    body('type').optional().isIn(['loan', 'donation', 'exchange']).withMessage('Invalid type'),
    body('status').optional().isIn(['available', 'borrowed', 'reserved']).withMessage('Invalid status'),
  ]),
  updatePost
);
router.delete('/posts/:id', deletePost);

module.exports = router;
