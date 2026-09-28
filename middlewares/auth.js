const AuthService = require('../services/auth');
const UserModel = require('../models/user');

async function resolveUser(req) {
    const payload = AuthService.fromRequest(req);
    if (!payload?.userId) return null;
    return UserModel.findById(payload.userId);
}

async function authenticate(req, res, next) {
    const user = await resolveUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Войдите в аккаунт.' });
    }

    req.user = user;
    next();
}

async function maybeAuthenticate(req, res, next) {
    req.user = await resolveUser(req);
    next();
}

module.exports = {
    authenticate,
    maybeAuthenticate,
};
