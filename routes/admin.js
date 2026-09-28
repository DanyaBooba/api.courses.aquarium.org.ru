const express = require('express');
const AdminController = require('../controllers/admin');
const { authenticate } = require('../middlewares/auth');
const requireAccess = require('../middlewares/requireAccess');
const { ACCESS } = require('../config/access');

const router = express.Router();

router.use(authenticate, requireAccess(ACCESS.ADMIN));

router.get('/users', AdminController.users);
router.patch('/users/:id/access', AdminController.setAccess);

module.exports = router;
