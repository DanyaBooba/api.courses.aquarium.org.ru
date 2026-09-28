const express = require('express');
const UploadsController = require('../controllers/uploads');
const { authenticate } = require('../middlewares/auth');
const requireAccess = require('../middlewares/requireAccess');
const { ACCESS } = require('../config/access');

const router = express.Router();

router.post(
    '/uploads',
    authenticate,
    requireAccess(ACCESS.AUTHOR),
    express.raw({ type: Object.keys(UploadsController.TYPES), limit: `${UploadsController.MAX_SIZE_MB}mb` }),
    UploadsController.create
);

module.exports = router;
