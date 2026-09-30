// Названия уроков — без номера.
//
// Раньше у урока было два названия: title с номером («2. Как устроен сайт») и
// short без него — для меню. Теперь название одно, title, и оно без номера:
// номер сайт добавляет сам. Скрипт убирает номер из начала title, а пустой
// title заполняет из short. Поле short не трогает.
//
//   node database/migrate-lesson-titles.js           — показать, что изменится
//   node database/migrate-lesson-titles.js --apply   — записать в базу
//
// Перед записью закройте панель управления: открытый урок при автосохранении
// вернул бы старое название. Запускать повторно можно — второй раз менять нечего.

require('dotenv').config();

const pool = require('../config/db');

const NUMBER = /^\s*\d+\s*[.)]\s*/;

function cleanTitle(page) {
    const title = String(page.title ?? '').trim() || String(page.short ?? '').trim();
    return title.replace(NUMBER, '').trim() || title;
}

async function main() {
    const apply = process.argv.includes('--apply');
    const [rows] = await pool.query('SELECT id, pages FROM courses ORDER BY created_at');

    let changed = 0;

    for (const row of rows) {
        const pages = typeof row.pages === 'string' ? JSON.parse(row.pages) : row.pages;
        const lines = [];

        const next = pages.map((page) => {
            const title = cleanTitle(page);
            if (title === page.title) return page;
            lines.push(`  ${page.slug}: «${page.title ?? ''}» → «${title}»`);
            return { ...page, title };
        });

        if (!lines.length) continue;
        changed += lines.length;
        console.log(`${row.id}\n${lines.join('\n')}`);

        // updated_at не трогаем: это техническая правка, а не новая редакция курса
        if (apply) await pool.query('UPDATE courses SET pages = ? WHERE id = ?', [JSON.stringify(next), row.id]);
    }

    if (!changed) console.log('Все названия уже без номеров.');
    else if (apply) console.log(`\nГотово: обновлено уроков — ${changed}.`);
    else console.log(`\nИзменится уроков: ${changed}. Чтобы записать, запустите с --apply.`);

    await pool.end();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
