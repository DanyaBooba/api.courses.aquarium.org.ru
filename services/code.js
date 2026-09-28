const crypto = require('crypto');

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const LENGTH = 6;
const MAX_ATTEMPTS = 5;
const LIFETIME_CODE_MIN = parseInt(process.env.LIFETIME_CODE_MIN || '10', 10);
const PATTERN = new RegExp(`^[${ALPHABET}]{${LENGTH}}$`);

class CodeService {
    static LENGTH = LENGTH;
    static MAX_ATTEMPTS = MAX_ATTEMPTS;
    static LIFETIME_CODE_MIN = LIFETIME_CODE_MIN;

    static create() {
        let code = '';
        for (let i = 0; i < LENGTH; i++) {
            code += ALPHABET[crypto.randomInt(ALPHABET.length)];
        }

        return {
            code,
            expiresAt: new Date(Date.now() + LIFETIME_CODE_MIN * 60_000),
        };
    }

    static normalize(value) {
        return String(value ?? '').toUpperCase().replace(/[\s-]/g, '');
    }

    static isValid(code) {
        return PATTERN.test(code);
    }

    static hash(code) {
        return crypto.createHmac('sha256', process.env.TOKEN_SECRET).update(code).digest('hex');
    }

    static matches(code, hash) {
        const a = Buffer.from(CodeService.hash(code), 'hex');
        const b = Buffer.from(hash, 'hex');
        return a.length === b.length && crypto.timingSafeEqual(a, b);
    }
}

module.exports = CodeService;
