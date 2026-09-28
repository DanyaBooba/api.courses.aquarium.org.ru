const express = require('express');
const ProfileController = require('../controllers/profile');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.get('/profile', authenticate, ProfileController.show);
router.patch('/profile', authenticate, ProfileController.update);
router.get('/profile/courses', authenticate, ProfileController.courses);

module.exports = router;
