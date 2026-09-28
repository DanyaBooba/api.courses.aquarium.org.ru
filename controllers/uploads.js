const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

// Картинки уроков и обложки курсов. Файл приходит телом запроса как есть
// (Content-Type — тип картинки), без multipart: так не нужна отдельная библиотека.
// SVG не принимаем: открытый напрямую, он может выполнить скрипт на домене API.
const TYPES = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
};

const MAX_SIZE_MB = 10;
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');

class UploadsController {
    static async create(req, res) {
        const ext = TYPES[req.get('content-type')];
        if (!ext) {
            return res.status(415).json({ message: 'Подойдёт картинка JPG, PNG, WebP, GIF или AVIF.' });
        }
        if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
            return res.status(400).json({ message: 'Файл пустой.' });
        }

        // Раскладываем по месяцам, чтобы в одной папке не копились тысячи файлов
        const month = new Date().toISOString().slice(0, 7);
        const name = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString('hex')}.${ext}`;

        await fs.mkdir(path.join(UPLOADS_DIR, month), { recursive: true });
        await fs.writeFile(path.join(UPLOADS_DIR, month, name), req.body);

        const base = (process.env.API_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
        return res.status(201).json({ url: `${base}/uploads/${month}/${name}` });
    }
}

UploadsController.TYPES = TYPES;
UploadsController.MAX_SIZE_MB = MAX_SIZE_MB;
UploadsController.UPLOADS_DIR = UPLOADS_DIR;

module.exports = UploadsController;
