const { COLORS, SANS, escape, title, paragraph, button, layout } = require('./layout');

function formatDate(date) {
    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Moscow',
    }).format(new Date(date));
}

module.exports = ({ email, createdAt }) => layout({
    preview: `${escape(email)} ждёт подтверждения`,
    body: `
        ${title('Новый автор')}
        ${paragraph('В сервисе новый пользователь. Доступа пока нет: профиль пустой, пока вы не выдадите права.')}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 8px 0 0; font-family: ${SANS}; font-size: 15px; line-height: 1.6;">
            <tr>
                <td class="dd-tertiary" style="padding: 10px 0; width: 110px; color: ${COLORS.tertiary}; border-top: 1px solid ${COLORS.border};">Почта</td>
                <td class="dd-text" style="padding: 10px 0; color: ${COLORS.text}; border-top: 1px solid ${COLORS.border};"><b>${escape(email)}</b></td>
            </tr>
            <tr>
                <td class="dd-tertiary" style="padding: 10px 0; color: ${COLORS.tertiary}; border-top: 1px solid ${COLORS.border}; border-bottom: 1px solid ${COLORS.border};">Дата</td>
                <td class="dd-text" style="padding: 10px 0; color: ${COLORS.text}; border-top: 1px solid ${COLORS.border}; border-bottom: 1px solid ${COLORS.border};">${formatDate(createdAt)}</td>
            </tr>
        </table>
        ${button('Открыть сайт', process.env.APP_URL || 'https://courses.dybka.ru')}
    `,
});
