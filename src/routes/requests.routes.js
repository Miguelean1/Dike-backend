const { Router } = require('express');
const { body } = require('express-validator');
const { createRequest, getRequests, respondRequest } = require('../controllers/requests.controller');
const { authGuard } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');

const router = Router();

router.get('/', authGuard, getRequests);

router.post('/',
  authGuard,
  validate([
    body('post_id').isInt().withMessage('post_id must be an integer'),
    body('return_date').optional().isDate().withMessage('return_date must be a valid date'),
    body('message').optional().isString(),
  ]),
  createRequest
);

router.put('/:id',
  authGuard,
  validate([
    body('status').isIn(['accepted', 'rejected']).withMessage('Status must be accepted or rejected'),
  ]),
  respondRequest
);

module.exports = router;
