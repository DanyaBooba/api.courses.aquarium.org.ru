const express = require('express');
const rateLimit = require('express-rate-limit');
const CoursesController = require('../controllers/courses');
const { authenticate, maybeAuthenticate } = require('../middlewares/auth');
const requireAccess = require('../middlewares/requireAccess');
const { ACCESS } = require('../config/access');

const router = express.Router();

const author = [authenticate, requireAccess(ACCESS.AUTHOR)];

// Счётчик просмотров: с запасом на класс за одним IP, но без бесконечной накрутки
const viewLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    message: { message: 'Слишком много запросов, попробуйте позже.' },
    standardHeaders: 'draft-8',
    legacyHeaders: false,
});

// Токен необязателен: автор и администратор видят в каталоге и курсы на проверке
router.get('/courses', maybeAuthenticate, CoursesController.list);
router.get('/courses/:id', maybeAuthenticate, CoursesController.show);
router.post('/courses/:id/view', viewLimiter, maybeAuthenticate, CoursesController.view);
router.post('/courses', author, CoursesController.create);
router.put('/courses/:id', author, CoursesController.update);
router.delete('/courses/:id', author, CoursesController.remove);
router.post('/courses/:id/review', author, CoursesController.requestReview);
router.delete('/courses/:id/review', author, CoursesController.cancelReview);

module.exports = router;
