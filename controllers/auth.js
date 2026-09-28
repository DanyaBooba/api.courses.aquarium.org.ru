const UserModel = require('../models/user');
const CodeModel = require('../models/code');
const AuthService = require('../services/auth');
const CodeService = require('../services/code');
const EmailService = require('../services/email');
const { ACCESS, ADMIN_EMAILS } = require('../config/access');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readEmail(value) {
    const email = String(value ?? '').trim().toLowerCase();
    return EMAIL_PATTERN.test(email) && email.length <= 255 ? email : null;
}

class AuthController {
    static async code(req, res) {
        const email = readEmail(req.body?.email);
        if (!email) {
            return res.status(400).json({ message: 'Проверьте почту: в адресе нужна @ и домен.' });
        }

        const { code, expiresAt } = CodeService.create();
        await CodeModel.replace({ email, hash: CodeService.hash(code), expiresAt });

        try {
            await EmailService.sendCode(email, code, CodeService.LIFETIME_CODE_MIN);
        } catch (error) {
            console.error('Не удалось отправить код:', error.message);
            return res.status(502).json({ message: 'Не удалось отправить письмо. Попробуйте позже.' });
        }

        return res.json({});
    }

    static async verify(req, res) {
        const email = readEmail(req.body?.email);
        const code = CodeService.normalize(req.body?.code);

        if (!email || !CodeService.isValid(code)) {
            return res.status(400).json({ message: 'Неверный код.' });
        }

        const found = await CodeModel.findByEmail(email);
        if (!found || new Date(found.expires_at) <= new Date()) {
            return res.status(400).json({ message: 'Код устарел. Запросите новый.' });
        }

        if (found.attempts >= CodeService.MAX_ATTEMPTS) {
            await CodeModel.delete(found.id);
            return res.status(429).json({ message: 'Слишком много попыток. Запросите новый код.' });
        }

        if (!CodeService.matches(code, found.code_hash)) {
            await CodeModel.addAttempt(found.id);
            return res.status(400).json({ message: 'Неверный код.' });
        }

        await CodeModel.delete(found.id);

        let user = await UserModel.findByEmail(email);
        if (!user) {
            const access = ADMIN_EMAILS.includes(email) ? ACCESS.ADMIN : ACCESS.NONE;
            user = await UserModel.create({ email, access });

            if (access === ACCESS.NONE) {
                await EmailService.sendAdminNewUser(user);
            }
        }

        await UserModel.touchLogin(user.id);

        return res.json({
            token: AuthService.sign(user.id),
            user: UserModel.toPublic(user),
        });
    }
}

module.exports = AuthController;
