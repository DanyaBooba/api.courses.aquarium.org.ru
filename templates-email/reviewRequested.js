const { escape, title, paragraph, button, layout } = require('./layout');

module.exports = ({ course, author }) => layout({
    preview: `«${escape(course.title)}» ждёт проверки`,
    body: `
        ${title('Курс ждёт проверки')}
        ${paragraph(`${escape(author.name || author.email)} просит опубликовать курс <b>«${escape(course.title)}»</b>. Пока вы его не опубликуете, читатели не видят данный курс..`)}
        ${button('Открыть курс', `${process.env.APP_URL || 'https://courses.dybka.ru'}/admin/course/${encodeURIComponent(course.id)}`)}
    `,
});
