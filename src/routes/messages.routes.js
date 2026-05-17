const { Router } = require('express');
const { getConversation, sendMessage, markAsRead } = require('../controllers/messages.controller');
const { authGuard } = require('../middleware/auth.middleware');

const router = Router();

router.get('/:userId', authGuard, getConversation);
router.post('/', authGuard, sendMessage);
router.put('/:id/read', authGuard, markAsRead);

module.exports = router;
