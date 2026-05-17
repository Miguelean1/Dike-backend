const { Router } = require('express');
const { createRating, getUserRatings } = require('../controllers/ratings.controller');
const { authGuard } = require('../middleware/auth.middleware');

const router = Router();

router.get('/user/:userId', getUserRatings);
router.post('/', authGuard, createRating);

module.exports = router;
