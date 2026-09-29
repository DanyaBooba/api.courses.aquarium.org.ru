const CourseModel = require('../models/course');
const UserModel = require('../models/user');
const EmailService = require('../services/email');
const validateCourse = require('../services/validateCourse');
const { validateUpdatedAt } = validateCourse;
const { ACCESS } = require('../config/access');

function canEdit(user, course) {
    return Boolean(user) && (user.access >= ACCESS.ADMIN || course.ownerId === user.id);
}

function isAdmin(user) {
    return user.access >= ACCESS.ADMIN;
}

// Модерация: публикует курс только администратор. Автор скрывает свой курс
// сам, а чтобы открыть его читателям, отправляет на проверку
// (POST /courses/:id/review) — администратору приходит письмо.
// Курс на проверке читателям не показывается совсем — ни карточкой
// «Ведётся работа», ни по прямой ссылке. Видят его только автор и администратор
function hiddenFrom(user, course) {
    return course.disabled && Boolean(course.reviewRequestedAt) && !canEdit(user, course);
}

const VISITOR_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PUBLISH_FORBIDDEN = 'Опубликовать курс может только администратор — отправьте его на проверку.';

class CoursesController {
    static async list(req, res) {
        const courses = await CourseModel.list();
        return res.json({ courses: courses.filter((course) => !hiddenFrom(req.user, course)) });
    }

    static async show(req, res) {
        const course = await CourseModel.findById(req.params.id);

        if (!course || hiddenFrom(req.user, course)) {
            return res.status(404).json({ message: 'Курс не найден.' });
        }

        // Закрытый курс целиком видят только его автор и администратор.
        // Остальным — плашка «Ведётся работа»: курс есть, но уроки пока не отдаём
        if (course.disabled && !canEdit(req.user, course)) {
            return res.status(403).json({ message: 'Над курсом ведётся работа.', status: 'wip' });
        }

        return res.json({ course });
    }

    /**
     * Читатель открыл курс. `visitorId` — анонимный UUID из браузера:
     * по нему считаются разные читатели. Автор курса и администратор
     * статистику не накручивают, закрытые курсы не считаются.
     */
    static async view(req, res) {
        const visitorId = req.body?.visitorId;
        if (typeof visitorId !== 'string' || !VISITOR_ID.test(visitorId)) {
            return res.status(400).json({ message: 'Некорректный идентификатор читателя.' });
        }

        const course = await CourseModel.findById(req.params.id);
        if (!course || course.disabled) return res.status(404).json({ message: 'Курс не найден.' });

        if (!canEdit(req.user, course)) await CourseModel.addView(course.id, visitorId.toLowerCase());
        return res.status(204).end();
    }

    static async create(req, res) {
        const { course, error } = validateCourse(req.body);
        if (error) return res.status(400).json({ message: error });

        course.author ??= { name: req.user.name, email: req.user.email, telegram: null };
        // Новый курс автора всегда скрыт: открыть его можно только через проверку
        if (!isAdmin(req.user)) course.disabled = true;

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

        // Дату изменения автор может выставить сам — иначе это время сохранения
        const date = validateUpdatedAt(req.body.updatedAt);
        if (date.error) return res.status(400).json({ message: date.error });

        const publishing = existing.disabled && !course.disabled;
        if (publishing && !isAdmin(req.user)) return res.status(403).json({ message: PUBLISH_FORBIDDEN });

        let updated = await CourseModel.update(course, date.updatedAt ? { updatedAt: date.updatedAt } : {});

        // Администратор опубликовал курс, который ждал проверки: снимаем с проверки
        // и сообщаем автору — если это не его собственный курс
        if (publishing && existing.reviewRequestedAt) {
            updated = await CourseModel.setReview(existing.id, null);
            if (existing.ownerId !== req.user.id) {
                const owner = await UserModel.findById(existing.ownerId);
                if (owner) await EmailService.sendCoursePublished(owner, updated);
            }
        }

        return res.json({ course: updated });
    }

    /** Автор отправляет скрытый курс на проверку — администраторам уходит письмо. */
    static async requestReview(req, res) {
        const existing = await CourseModel.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: 'Курс не найден.' });
        if (!canEdit(req.user, existing)) return res.status(403).json({ message: 'Это не ваш курс.' });
        if (!existing.disabled) return res.status(400).json({ message: 'Курс уже опубликован.' });
        if (existing.reviewRequestedAt) return res.json({ course: existing });

        const course = await CourseModel.setReview(existing.id, new Date());
        const owner = (await UserModel.findById(existing.ownerId)) ?? req.user;
        await EmailService.sendReviewRequested(await UserModel.adminEmails(), course, owner);

        return res.json({ course });
    }

    /**
     * Снять курс с проверки. Автор так отзывает заявку; администратор —
     * возвращает курс на доработку, и автору уходит письмо с причиной `reason`.
     */
    static async cancelReview(req, res) {
        const existing = await CourseModel.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: 'Курс не найден.' });
        if (!canEdit(req.user, existing)) return res.status(403).json({ message: 'Это не ваш курс.' });
        if (!existing.reviewRequestedAt) return res.json({ course: existing });

        const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim().slice(0, 2000) : '';
        const course = await CourseModel.setReview(existing.id, null);

        if (existing.ownerId !== req.user.id) {
            const owner = await UserModel.findById(existing.ownerId);
            if (owner) await EmailService.sendReviewDeclined(owner, course, reason);
        }

        return res.json({ course });
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
