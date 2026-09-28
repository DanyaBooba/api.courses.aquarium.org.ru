const { ACCESS } = require('../config/access');

const requireAccess = (minAccess) => (req, res, next) => {
    if (req.user.access >= minAccess) return next();

    if (req.user.access === ACCESS.NONE) {
        return res.status(403).json({
            message: 'Аккаунт ждёт подтверждения администратора.',
            status: 'pending',
        });
    }

    return res.status(403).json({ message: 'Недостаточно прав.' });
};

module.exports = requireAccess;
