const jwt = require('jsonwebtoken');

const LIFETIME_TOKEN_DAYS = parseInt(process.env.LIFETIME_TOKEN_DAYS || '30', 10);

class AuthService {
    static sign(userId) {
        return jwt.sign({ userId }, process.env.TOKEN_SECRET, {
            expiresIn: `${LIFETIME_TOKEN_DAYS}d`,
        });
    }

    static verify(token) {
        try {
            return jwt.verify(token, process.env.TOKEN_SECRET);
        } catch {
            return null;
        }
    }

    static fromRequest(req) {
        const [type, token] = (req.headers.authorization || '').split(' ');
        if (type !== 'Bearer' || !token) return null;
        return AuthService.verify(token);
    }
}

module.exports = AuthService;
