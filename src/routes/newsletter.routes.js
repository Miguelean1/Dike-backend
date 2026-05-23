const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { sendRecommendation } = require('../controllers/newsletter.controller');

router.post(
  '/subscribe',
  validate([
    body('email').notEmpty().withMessage('Email requerido').isEmail().withMessage('Email inválido'),
  ]),
  sendRecommendation
);

module.exports = router;
