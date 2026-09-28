const { COLORS, MONO, escape, title, paragraph, note, layout } = require('./layout');

function codeCells(code) {
    const cells = [...code]
        .map((char) => `
            <td class="dd-code" align="center" style="width: 48px; height: 60px; background-color: ${COLORS.codeBg}; border: 1px solid ${COLORS.border}; font-family: ${MONO}; font-size: 30px; font-weight: 600; color: ${COLORS.text};">
                ${escape(char)}
            </td>`)
        .join('<td style="width: 6px;"></td>');

    return `
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0 8px;">
            <tr>${cells}</tr>
        </table>`;
}

module.exports = ({ code, lifetimeMin }) => layout({
    preview: `Код для входа: ${escape(code)}`,
    body: `
        ${title('Код для входа')}
        ${paragraph('Введите этот код на странице авторизации. Регистр букв не важен.')}
        ${codeCells(code)}
        ${paragraph(`<span class="dd-tertiary" style="color: ${COLORS.tertiary}; font-size: 14px;">Код действует ${lifetimeMin} мин. и сработает один раз.</span>`)}
        ${note('<b>Никому не передавайте этот код.</b> Если вы не запрашивали вход, просто проигнорируйте письмо.')}
    `,
});
