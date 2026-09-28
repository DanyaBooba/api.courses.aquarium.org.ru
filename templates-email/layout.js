const SERIF = "'Literata', 'PT Serif', Georgia, 'Times New Roman', serif";
const SANS = "'Geologica', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
const MONO = "'SF Mono', ui-monospace, SFMono-Regular, 'JetBrains Mono', Menlo, Consolas, monospace";

const COLORS = {
    paper: '#fcfbf8',
    surface: '#ffffff',
    border: '#e5e2d9',
    rule: '#1b1a15',
    text: '#1b1a15',
    secondary: '#403d35',
    tertiary: '#736e60',
    ink: '#24221d',
    codeBg: '#f4f3ee',
    noteBg: '#f6ecd2',
    noteBar: '#8f6508',
};

function escape(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function title(text) {
    return `
        <h1 class="dd-text" style="margin: 0 0 16px; font-family: ${SERIF}; font-size: 32px; line-height: 1.1; font-weight: 450; letter-spacing: -0.03em; color: ${COLORS.text};">
            ${text}
        </h1>`;
}

function paragraph(text) {
    return `
        <p class="dd-secondary" style="margin: 0 0 16px; font-family: ${SANS}; font-size: 16px; line-height: 1.7; color: ${COLORS.secondary};">
            ${text}
        </p>`;
}

function button(text, href) {
    return `
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0 8px;">
            <tr>
                <td class="dd-button" bgcolor="${COLORS.ink}" style="background-color: ${COLORS.ink}; background-image: linear-gradient(180deg, #4a4843 0%, ${COLORS.ink} 100%);">
                    <a class="dd-button-link" href="${escape(href)}" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: ${SANS}; font-size: 16px; font-weight: 700; letter-spacing: 0.005em; color: #ffffff; text-decoration: none;">
                        ${text}
                    </a>
                </td>
            </tr>
        </table>`;
}

function note(text) {
    return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0 0;">
            <tr>
                <td class="dd-note" style="background-color: ${COLORS.noteBg}; border-left: 3px solid ${COLORS.noteBar}; padding: 14px 18px; font-family: ${SANS}; font-size: 14px; line-height: 1.6; color: ${COLORS.secondary};">
                    ${text}
                </td>
            </tr>
        </table>`;
}

function layout({ preview, body }) {
    return `<!doctype html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <link href="https://fonts.googleapis.com/css2?family=Geologica:wght@300;400;700&family=Literata:opsz,wght@7..72,400;7..72,500&display=swap" rel="stylesheet">
    <style>
        @media (prefers-color-scheme: dark) {
            .dd-body { background-color: #16150f !important; }
            .dd-card { background-color: #1d1c14 !important; border-color: #33301f !important; }
            .dd-rule { border-color: #f2efe6 !important; }
            .dd-text { color: #f2efe6 !important; }
            .dd-secondary { color: #c3bead !important; }
            .dd-tertiary { color: #8d8776 !important; }
            .dd-code { background-color: #201e15 !important; border-color: #33301f !important; color: #f2efe6 !important; }
            .dd-note { background-color: #2e2712 !important; border-color: #d9a938 !important; color: #c3bead !important; }
            .dd-button { background-color: #e4dfd2 !important; background-image: none !important; }
            .dd-button-link { color: #16150f !important; }
        }
        @media (max-width: 520px) {
            .dd-card { padding: 28px 20px !important; }
            .dd-code { font-size: 24px !important; padding: 12px 12px 12px 20px !important; }
        }
    </style>
</head>
<body class="dd-body" style="margin: 0; padding: 0; background-color: ${COLORS.paper};">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${preview}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="dd-body" style="background-color: ${COLORS.paper};">
        <tr>
            <td align="center" style="padding: 40px 16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px;">
                    <tr>
                        <td class="dd-rule" style="padding: 0 0 14px; border-bottom: 2px solid ${COLORS.rule};">
                            <a href="https://courses.dybka.ru" target="_blank" class="dd-text" style="font-family: ${SERIF}; font-size: 20px; font-weight: 500; letter-spacing: -0.015em; color: ${COLORS.text}; text-decoration: none;">courses.dybka.ru</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 24px 0 0;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td class="dd-card" style="background-color: ${COLORS.surface}; border: 1px solid ${COLORS.border}; padding: 40px 36px;">
                                        ${body}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td class="dd-tertiary" style="padding: 24px 0 0; font-family: ${SANS}; font-size: 13px; line-height: 1.6; color: ${COLORS.tertiary};">
                            Бесплатные открытые курсы по программированию без нейросетей и встроенных платежей.<br>
                            Даниил Дыбка · <a href="https://courses.dybka.ru" target="_blank" class="dd-tertiary" style="color: ${COLORS.tertiary};">courses.dybka.ru</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

module.exports = {
    COLORS,
    MONO,
    SANS,
    escape,
    title,
    paragraph,
    button,
    note,
    layout,
};
