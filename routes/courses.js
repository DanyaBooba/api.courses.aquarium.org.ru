const express = require('express');
const CoursesController = require('../controllers/courses');
const { authenticate, maybeAuthenticate } = require('../middlewares/auth');
const requireAccess = require('../middlewares/requireAccess');
const { ACCESS } = require('../config/access');

const router = express.Router();

const author = [authenticate, requireAccess(ACCESS.AUTHOR)];

router.get('/courses', CoursesController.list);
router.get('/courses/:id', maybeAuthenticate, CoursesController.show);
router.post('/courses', author, CoursesController.create);
router.put('/courses/:id', author, CoursesController.update);
router.delete('/courses/:id', author, CoursesController.remove);

module.exports = router;
