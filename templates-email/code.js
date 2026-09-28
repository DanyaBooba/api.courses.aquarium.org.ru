const { COLORS, MONO, escape, title, paragraph, note, layout } = require('./layout');

// Код одной строкой в одной ячейке: копируется целиком, без пробелов между символами.
// Разрядку даёт letter-spacing — он не добавляет символов в выделение.
// Справа отступ меньше, чем слева: letter-spacing оставляет хвост после последнего символа.
function codeBlock(code) {
    return `
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0 8px;">
            <tr>
                <td class="dd-code" style="padding: 14px 16px 14px 26px; background-color: ${COLORS.codeBg}; border: 1px solid ${COLORS.border}; font-family: ${MONO}; font-size: 30px; font-weight: 600; letter-spacing: 0.35em; line-height: 1.2; color: ${COLORS.text}; white-space: nowrap;">${escape(code)}</td>
            </tr>
        </table>`;
}

module.exports = ({ code, lifetimeMin }) => layout({
    preview: `Код для входа: ${escape(code)}`,
    body: `
        ${title('Код для входа')}
        ${paragraph('Введите этот код на странице авторизации. Регистр букв не важен.')}
        ${codeBlock(code)}
        ${paragraph(`<span class="dd-tertiary" style="color: ${COLORS.tertiary}; font-size: 14px;">Код действует ${lifetimeMin} мин. и сработает один раз.</span>`)}
        ${note('<b>Никому не передавайте этот код.</b> Если вы не запрашивали вход, просто проигнорируйте письмо.')}
    `,
});
