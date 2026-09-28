const CourseModel = require('../models/course');
const validateCourse = require('../services/validateCourse');
const { ACCESS } = require('../config/access');

function canEdit(user, course) {
    return Boolean(user) && (user.access >= ACCESS.ADMIN || course.ownerId === user.id);
}

class CoursesController {
    static async list(req, res) {
        const courses = await CourseModel.list();
        return res.json({ courses });
    }

    static async show(req, res) {
        const course = await CourseModel.findById(req.params.id);

        if (!course || (course.disabled && !canEdit(req.user, course))) {
            return res.status(404).json({ message: 'Курс не найден.' });
        }

        return res.json({ course });
    }

    static async create(req, res) {
        const { course, error } = validateCourse(req.body);
        if (error) return res.status(400).json({ message: error });

        course.author ??= { name: req.user.name, email: req.user.email, telegram: null };

        try {
            const created = await CourseModel.create(course, req.user.id);
            return res.status(201).json({ course: created });
        } catch (error) {
            if (error.code !== 'ER_DUP_ENTRY') throw error;
            return res.status(409).json({ message: `Адрес «${course.id}» уже занят другим курсом.` });
        }
    }

    static async update(req, res) {
        const existing = await CourseModel.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: 'Курс не найден.' });
        if (!canEdit(req.user, existing)) return res.status(403).json({ message: 'Это не ваш курс.' });

        const { course, error } = validateCourse(req.body, { id: existing.id });
        if (error) return res.status(400).json({ message: error });

        const updated = await CourseModel.update(course);
        return res.json({ course: updated });
    }

    static async remove(req, res) {
        const existing = await CourseModel.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: 'Курс не найден.' });
        if (!canEdit(req.user, existing)) return res.status(403).json({ message: 'Это не ваш курс.' });

        await CourseModel.delete(existing.id);
        return res.status(204).end();
    }
}

module.exports = CoursesController;
