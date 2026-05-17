const { Router } = require('express');
const { body } = require('express-validator');
const { getConversation, sendMessage, markAsRead } = require('../controllers/messages.controller');
const { authGuard } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');

const router = Router();

router.get('/:userId', authGuard, getConversation);

router.post('/',
  authGuard,
  validate([
    body('receiver_id').isInt().withMessage('receiver_id must be an integer'),
    body('content').notEmpty().withMessage('Content is required'),
  ]),
  sendMessage
);

router.put('/:id/read', authGuard, markAsRead);

module.exports = router;
