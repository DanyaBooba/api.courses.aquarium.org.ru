const CourseModel = require('../models/course');

// Карта сайта для поисковиков: главная, открытые курсы и их уроки, правовые
// страницы. Собирается из базы на каждый запрос — новый курс или урок из
// панели управления попадает в неё сразу, без пересборки сайта.
// Закрытые курсы (disabled) не попадают: читателям они не видны.

const SITE_URL = (process.env.APP_URL || 'https://courses.dybka.ru').replace(/\/$/, '');
const STATIC_PAGES = ['/privacy', '/consent'];

const escape = (value) =>
    String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function url(path, { lastmod, priority } = {}) {
    return [
        '  <url>',
        `    <loc>${escape(SITE_URL + path)}</loc>`,
        lastmod ? `    <lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>` : null,
        priority ? `    <priority>${priority}</priority>` : null,
        '  </url>',
    ]
        .filter(Boolean)
        .join('\n');
}

class SitemapController {
    static async show(req, res) {
        const courses = (await CourseModel.list()).filter((course) => !course.disabled);
        const lastUpdate = courses.reduce((latest, course) => Math.max(latest, new Date(course.updatedAt)), 0);

        const urls = [
            url('/', { lastmod: lastUpdate || null, priority: '1.0' }),
            ...courses.flatMap((course) => [
                url(`/course/${course.id}`, { lastmod: course.updatedAt, priority: '0.8' }),
                ...course.pages.map((page) =>
                    url(`/course/${course.id}/${page.slug}`, { lastmod: course.updatedAt, priority: '0.6' })
                ),
            ]),
            ...STATIC_PAGES.map((path) => url(path, { priority: '0.2' })),
        ];

        const xml = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            ...urls,
            '</urlset>',
            '',
        ].join('\n');

        // Поисковики заходят редко, а курсы правятся не каждую минуту — час кэша хватит
        res.set('Cache-Control', 'public, max-age=3600');
        return res.type('application/xml').send(xml);
    }
}

module.exports = SitemapController;
