const pool = require('../config/db');

const JSON_FIELDS = ['chips', 'author', 'about', 'pages'];
const FIELDS = [
    'title', 'subtitle', 'accent', 'section', 'difficulty', 'disabled', 'level', 'duration',
    'image', 'video', 'chips', 'github', 'author', 'certificate', 'about', 'pages',
];

function parse(value, fallback) {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') return JSON.parse(value);
    return value;
}

function toRow(course) {
    return FIELDS.map((field) => {
        if (JSON_FIELDS.includes(field)) return JSON.stringify(course[field]);
        if (field === 'disabled') return course.disabled ? 1 : 0;
        return course[field];
    });
}

function toCourse(row, { full }) {
    const pages = parse(row.pages, []);

    return {
        id: row.id,
        title: row.title,
        subtitle: row.subtitle,
        accent: row.accent,
        section: row.section,
        difficulty: row.difficulty,
        disabled: Boolean(row.disabled),
        level: row.level,
        duration: row.duration,
        image: row.image,
        video: row.video,
        chips: parse(row.chips, []),
        github: row.github,
        author: parse(row.author, null),
        certificate: row.certificate,
        ownerId: row.user_id,
        // Когда автор отправил курс на проверку; null — проверки не ждёт
        reviewRequestedAt: row.review_requested_at ?? null,
        views: row.views_count ?? 0,
        readers: row.readers_count ?? 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        ...(full
            ? { about: parse(row.about, []), pages }
            : { pages: pages.map(({ slug, title, short }) => ({ slug, title, short })) }),
    };
}

class CourseModel {
    static async list({ userId } = {}) {
        const [rows] = userId
            ? await pool.query('SELECT * FROM courses WHERE user_id = ? ORDER BY created_at', [userId])
            : await pool.query('SELECT * FROM courses ORDER BY created_at');

        return rows.map((row) => toCourse(row, { full: false }));
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM courses WHERE id = ? LIMIT 1', [id]);
        return rows[0] ? toCourse(rows[0], { full: true }) : null;
    }

    static async create(course, userId) {
        const now = new Date();
        await pool.query(
            `INSERT INTO courses (id, user_id, ${FIELDS.join(', ')}, created_at, updated_at)
             VALUES (?, ?, ${FIELDS.map(() => '?').join(', ')}, ?, ?)`,
            [course.id, userId, ...toRow(course), now, now]
        );
        return CourseModel.findById(course.id);
    }

    // `updatedAt` — дата изменения, которую автор выставил сам; без неё — сейчас
    static async update(course, { updatedAt = new Date() } = {}) {
        await pool.query(
            `UPDATE courses SET ${FIELDS.map((field) => `${field} = ?`).join(', ')}, updated_at = ?
             WHERE id = ?`,
            [...toRow(course), updatedAt, course.id]
        );
        return CourseModel.findById(course.id);
    }

    /** Отправить на проверку (`date`) или снять с неё (`null`). */
    static async setReview(id, date) {
        await pool.query('UPDATE courses SET review_requested_at = ? WHERE id = ?', [date, id]);
        return CourseModel.findById(id);
    }

    /**
     * Засчитать открытие курса. Читатель `visitorId` считается один раз:
     * `readers_count` растёт, только если он пришёл на этот курс впервые.
     */
    static async addView(id, visitorId) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.query(
                'INSERT IGNORE INTO course_readers (course_id, visitor_id, first_seen_at) VALUES (?, ?, ?)',
                [id, visitorId, new Date()]
            );
            await connection.query(
                'UPDATE courses SET views_count = views_count + 1, readers_count = readers_count + ? WHERE id = ?',
                [result.affectedRows, id]
            );
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async delete(id) {
        await pool.query('DELETE FROM courses WHERE id = ?', [id]);
    }
}

module.exports = CourseModel;
