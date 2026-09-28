const express = require('express');
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/auth');

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    message: { message: 'Слишком много попыток, попробуйте позже.' },
    standardHeaders: 'draft-8',
    legacyHeaders: false,
});

router.post('/auth/code', authLimiter, AuthController.code);
router.post('/auth/verify', authLimiter, AuthController.verify);

module.exports = router;
