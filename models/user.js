const pool = require('../config/db');
const { ACCESS } = require('../config/access');

class UserModel {
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
        return rows[0] ?? null;
    }

    static async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
        return rows[0] ?? null;
    }

    static async create({ email, access }) {
        const [result] = await pool.query(
            'INSERT INTO users (email, access, created_at) VALUES (?, ?, ?)',
            [email, access, new Date()]
        );
        return UserModel.findById(result.insertId);
    }

    static async touchLogin(id) {
        await pool.query('UPDATE users SET last_login_at = ? WHERE id = ?', [new Date(), id]);
    }

    static async updateName(id, name) {
        await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, id]);
        return UserModel.findById(id);
    }

    static async updateAccess(id, access) {
        await pool.query('UPDATE users SET access = ? WHERE id = ?', [access, id]);
        return UserModel.findById(id);
    }

    static async list({ access } = {}) {
        if (access === undefined) {
            const [rows] = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
            return rows;
        }

        const [rows] = await pool.query(
            'SELECT * FROM users WHERE access = ? ORDER BY created_at DESC',
            [access]
        );
        return rows;
    }

    static async adminEmails() {
        const [rows] = await pool.query('SELECT email FROM users WHERE access >= ?', [ACCESS.ADMIN]);
        return rows.map((row) => row.email);
    }

    static toPublic(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            access: user.access,
            createdAt: user.created_at,
            lastLoginAt: user.last_login_at,
        };
    }
}

module.exports = UserModel;
