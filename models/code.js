const pool = require('../config/db');

class CodeModel {
    static async replace({ email, hash, expiresAt }) {
        await pool.query('DELETE FROM codes WHERE email = ?', [email]);
        await pool.query(
            'INSERT INTO codes (email, code_hash, created_at, expires_at) VALUES (?, ?, ?, ?)',
            [email, hash, new Date(), expiresAt]
        );
    }

    static async findByEmail(email) {
        const [rows] = await pool.query(
            'SELECT * FROM codes WHERE email = ? ORDER BY id DESC LIMIT 1',
            [email]
        );
        return rows[0] ?? null;
    }

    static async addAttempt(id) {
        await pool.query('UPDATE codes SET attempts = attempts + 1 WHERE id = ?', [id]);
    }

    static async delete(id) {
        await pool.query('DELETE FROM codes WHERE id = ?', [id]);
    }
}

module.exports = CodeModel;
