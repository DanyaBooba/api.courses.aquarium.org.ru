const { escape, title, paragraph, button, layout } = require('./layout');

module.exports = ({ name }) => layout({
    preview: 'Администратор подтвердил ваш аккаунт',
    body: `
        ${title('Доступ открыт')}
        ${paragraph(`${name ? `${escape(name)}, администратор` : 'Администратор'} подтвердил ваш аккаунт. Теперь можно добавлять свои программы на courses.dybka.ru.`)}
        ${button('Добавить программу', `${process.env.APP_URL || 'https://courses.dybka.ru'}/new`)}
    `,
});
