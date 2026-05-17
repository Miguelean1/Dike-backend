const { Router } = require('express');
const { body } = require('express-validator');
const { getPosts, getPost, createPost, updatePost, deletePost } = require('../controllers/posts.controller');
const { authGuard } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');

const router = Router();

router.get('/', getPosts);
router.get('/:id', getPost);

router.post('/',
  authGuard,
  validate([
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('type').isIn(['loan', 'donation', 'exchange']).withMessage('Type must be loan, donation or exchange'),
    body('image').optional().isURL().withMessage('Image must be a valid URL'),
    body('tagIds').optional().isArray().withMessage('tagIds must be an array'),
  ]),
  createPost
);

router.put('/:id',
  authGuard,
  validate([
    body('type').optional().isIn(['loan', 'donation', 'exchange']).withMessage('Type must be loan, donation or exchange'),
    body('status').optional().isIn(['active', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('image').optional().isURL().withMessage('Image must be a valid URL'),
    body('tagIds').optional().isArray().withMessage('tagIds must be an array'),
  ]),
  updatePost
);

router.delete('/:id', authGuard, deletePost);

module.exports = router;
