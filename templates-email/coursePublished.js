const { escape, title, paragraph, button, layout } = require('./layout');

module.exports = ({ course }) => layout({
    preview: `«${escape(course.title)}» опубликован`,
    body: `
        ${title('Курс опубликован')}
        ${paragraph(`Администратор проверил и опубликовал курс <b>«${escape(course.title)}»</b>. Теперь его видят все читатели.`)}
        ${button('Открыть курс', `${process.env.APP_URL || 'https://courses.dybka.ru'}/course/${encodeURIComponent(course.id)}`)}
    `,
});
