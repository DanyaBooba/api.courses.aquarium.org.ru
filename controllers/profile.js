const UserModel = require('../models/user');
const CourseModel = require('../models/course');

class ProfileController {
    static async show(req, res) {
        return res.json({ user: UserModel.toPublic(req.user) });
    }

    static async update(req, res) {
        const name = String(req.body?.name ?? '').trim();
        if (name.length > 120) {
            return res.status(400).json({ message: 'Имя длиннее 120 символов.' });
        }

        const user = await UserModel.updateName(req.user.id, name);
        return res.json({ user: UserModel.toPublic(user) });
    }

    static async courses(req, res) {
        const courses = await CourseModel.list({ userId: req.user.id });
        return res.json({ courses });
    }
}

module.exports = ProfileController;
