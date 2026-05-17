const { Router } = require('express');
const { body } = require('express-validator');
const { createRating, getUserRatings } = require('../controllers/ratings.controller');
const { authGuard } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');

const router = Router();

router.get('/user/:userId', getUserRatings);

router.post('/',
  authGuard,
  validate([
    body('rated_user_id').isInt().withMessage('rated_user_id must be an integer'),
    body('score').isInt({ min: 1, max: 5 }).withMessage('Score must be between 1 and 5'),
    body('post_id').optional().isInt().withMessage('post_id must be an integer'),
    body('comment').optional().isString(),
  ]),
  createRating
);

module.exports = router;
