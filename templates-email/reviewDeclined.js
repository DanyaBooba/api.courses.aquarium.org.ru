const { escape, title, paragraph, button, note, layout } = require('./layout');

module.exports = ({ course, reason }) => layout({
    preview: `«${escape(course.title)}» пока не опубликован`,
    body: `
        ${title('Курс пока не опубликован')}
        ${paragraph(`Администратор вернул курс <b>«${escape(course.title)}»</b> на доработку. Поправьте его и отправьте на проверку ещё раз.`)}
        ${reason ? note(escape(reason).replace(/\n/g, '<br>')) : ''}
        ${button('Открыть курс', `${process.env.APP_URL || 'https://courses.dybka.ru'}/admin/course/${encodeURIComponent(course.id)}`)}
    `,
});
