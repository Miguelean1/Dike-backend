const { Router } = require('express');
const { getPosts, getPost, createPost, updatePost, deletePost } = require('../controllers/posts.controller');
const { authGuard } = require('../middleware/auth.middleware');

const router = Router();

router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', authGuard, createPost);
router.put('/:id', authGuard, updatePost);
router.delete('/:id', authGuard, deletePost);

module.exports = router;
