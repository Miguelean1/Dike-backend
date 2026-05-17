const { Router } = require('express');
const { body } = require('express-validator');
const { getPosts, getPost, createPost, updatePost, deletePost } = require('../controllers/posts.controller');
const { authGuard } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = Router();

router.get('/', getPosts);
router.get('/:id', getPost);

router.post('/',
  authGuard,
  ...upload('posts'),
  validate([
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('type').isIn(['loan', 'donation', 'exchange']).withMessage('Type must be loan, donation or exchange'),
  ]),
  createPost
);

router.put('/:id',
  authGuard,
  ...upload('posts'),
  validate([
    body('type').optional().isIn(['loan', 'donation', 'exchange']).withMessage('Type must be loan, donation or exchange'),
    body('status').optional().isIn(['active', 'completed', 'cancelled']).withMessage('Invalid status'),
  ]),
  updatePost
);

router.delete('/:id', authGuard, deletePost);

module.exports = router;
