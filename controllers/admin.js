const UserModel = require('../models/user');
const CourseModel = require('../models/course');
const EmailService = require('../services/email');
const { ACCESS, ACCESS_VALUES } = require('../config/access');

class AdminController {
    static async users(req, res) {
        const access = req.query.access === undefined ? undefined : Number(req.query.access);
        if (access !== undefined && !ACCESS_VALUES.includes(access)) {
            return res.status(400).json({ message: `Уровень доступа — один из: ${ACCESS_VALUES.join(', ')}.` });
        }

        const [users, courses] = await Promise.all([UserModel.list({ access }), CourseModel.list()]);

        // У каждого — его курсы: что написал, что открыто, что ждёт проверки
        const byOwner = new Map();
        courses.forEach(({ id, title, disabled, reviewRequestedAt, updatedAt, ownerId }) => {
            if (!byOwner.has(ownerId)) byOwner.set(ownerId, []);
            byOwner.get(ownerId).push({ id, title, disabled, reviewRequestedAt, updatedAt });
        });

        return res.json({
            users: users.map((user) => ({ ...UserModel.toPublic(user), courses: byOwner.get(user.id) ?? [] })),
        });
    }

    static async setAccess(req, res) {
        const id = Number(req.params.id);
        const access = req.body?.access;

        if (!ACCESS_VALUES.includes(access)) {
            return res.status(400).json({ message: `Уровень доступа — один из: ${ACCESS_VALUES.join(', ')}.` });
        }

        if (id === req.user.id) {
            return res.status(400).json({ message: 'Свой уровень доступа менять нельзя.' });
        }

        const user = await UserModel.findById(id);
        if (!user) return res.status(404).json({ message: 'Пользователь не найден.' });

        const updated = await UserModel.updateAccess(id, access);

        if (user.access === ACCESS.NONE && access > ACCESS.NONE) {
            await EmailService.sendAccessGranted(updated);
        }

        return res.json({ user: UserModel.toPublic(updated) });
    }
}

module.exports = AdminController;
