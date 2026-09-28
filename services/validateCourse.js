const ACCENTS = ['mint', 'lilac', 'peach', 'sky', 'rose', 'amber', 'teal', 'indigo', 'unity', 'node', 'expo'];
const BLOCKS = ['p', 'h2', 'h3', 'img', 'quote', 'note', 'code', 'ul', 'ol', 'table', 'checklist', 'courses', 'quiz'];
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

class CourseError extends Error {}

function text(value, field, { max, required = false, fallback = '' } = {}) {
    if (value === undefined || value === null || value === '') {
        if (required) throw new CourseError(`Заполните поле «${field}».`);
        return fallback;
    }
    if (typeof value !== 'string') throw new CourseError(`Поле «${field}» должно быть строкой.`);
    const trimmed = value.trim();
    if (required && !trimmed) throw new CourseError(`Заполните поле «${field}».`);
    if (trimmed.length > max) throw new CourseError(`Поле «${field}» длиннее ${max} символов.`);
    return trimmed;
}

function nullableText(value, field, max = 500) {
    const result = text(value, field, { max, fallback: null });
    return result || null;
}

function blocks(value, field) {
    if (value === undefined || value === null) return [];
    if (!Array.isArray(value)) throw new CourseError(`Поле «${field}» должно быть списком блоков.`);

    value.forEach((item, index) => {
        if (!item || typeof item !== 'object' || !BLOCKS.includes(item.block)) {
            throw new CourseError(`${field}: блок №${index + 1} неизвестного типа.`);
        }
    });

    return value;
}

function chips(value) {
    if (value === undefined || value === null) return [];
    if (!Array.isArray(value) || value.length > 12) {
        throw new CourseError('Теги — это список, не больше 12 штук.');
    }
    return value.map((chip) => text(chip, 'Тег', { max: 40, required: true }));
}

function author(value) {
    if (value === undefined || value === null) return null;
    if (typeof value !== 'object' || Array.isArray(value)) {
        throw new CourseError('Автор должен быть объектом { name, email, telegram }.');
    }
    return {
        name: text(value.name, 'Имя автора', { max: 120 }),
        email: nullableText(value.email, 'Почта автора', 255),
        telegram: nullableText(value.telegram, 'Telegram автора', 255),
    };
}

function pages(value) {
    if (value === undefined || value === null) return [];
    if (!Array.isArray(value)) throw new CourseError('Уроки должны быть списком.');

    const slugs = new Set();

    return value.map((page, index) => {
        const label = `Урок №${index + 1}`;
        if (!page || typeof page !== 'object') throw new CourseError(`${label}: неверный формат.`);

        const slug = text(page.slug, `${label}: слаг`, { max: 64, required: true });
        if (!SLUG.test(slug)) throw new CourseError(`${label}: слаг — латиница, цифры и дефис.`);
        if (slugs.has(slug)) throw new CourseError(`${label}: слаг «${slug}» уже занят.`);
        slugs.add(slug);

        return {
            ...page,
            slug,
            // Название не обязательно: только что созданный урок сохраняется ещё пустым
            title: text(page.title, `${label}: название`, { max: 200 }),
            short: text(page.short, `${label}: короткое название`, { max: 100 }),
            content: blocks(page.content, label),
        };
    });
}

function validateCourse(input, { id } = {}) {
    try {
        if (!input || typeof input !== 'object') throw new CourseError('Пустой запрос.');

        const courseId = id ?? text(input.id, 'Адрес курса', { max: 64, required: true });
        if (!SLUG.test(courseId)) {
            throw new CourseError('Адрес курса — латиница, цифры и дефис, например «unity-first-game».');
        }

        const accent = input.accent ?? 'mint';
        if (!ACCENTS.includes(accent)) {
            throw new CourseError(`Цвет курса — один из: ${ACCENTS.join(', ')}.`);
        }

        const difficulty = input.difficulty ?? 1;
        if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) {
            throw new CourseError('Сложность — целое число от 1 до 5.');
        }

        return {
            course: {
                id: courseId,
                title: text(input.title, 'Название', { max: 200, required: true }),
                subtitle: text(input.subtitle, 'Описание', { max: 500 }),
                accent,
                section: text(input.section, 'Раздел', { max: 32, required: true }),
                difficulty,
                disabled: input.disabled === undefined ? true : Boolean(input.disabled),
                level: text(input.level, 'Уровень', { max: 100 }),
                duration: text(input.duration, 'Объём', { max: 100 }),
                image: nullableText(input.image, 'Обложка'),
                video: nullableText(input.video, 'Видео'),
                chips: chips(input.chips),
                github: nullableText(input.github, 'GitHub'),
                author: author(input.author),
                certificate: nullableText(input.certificate, 'Сертификат'),
                about: blocks(input.about, 'О курсе'),
                pages: pages(input.pages),
            },
        };
    } catch (error) {
        if (error instanceof CourseError) return { error: error.message };
        throw error;
    }
}

module.exports = validateCourse;
