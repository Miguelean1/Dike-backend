const { Router } = require('express');
const { getUser, updateUser } = require('../controllers/users.controller');
const { authGuard } = require('../middleware/auth.middleware');

const router = Router();

router.get('/:id', getUser);
router.put('/:id', authGuard, updateUser);

module.exports = router;
