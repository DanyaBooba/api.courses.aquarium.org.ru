const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

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

// Всё сохраняем в JPEG: длинная сторона — не больше MAX_SIDE, качество — QUALITY.
// Этого хватает и для полноэкранного просмотра, а весит фото в разы меньше
const MAX_SIDE = 2000;
const QUALITY = 80;

/**
 * Сжимает картинку в JPEG: поворачивает по EXIF, уменьшает, прозрачность
 * заливает белым, метаданные (геолокацию, модель камеры) выбрасывает.
 * Анимированный GIF возвращает как есть — в JPEG от него остался бы один кадр.
 */
async function compress(buffer) {
    const meta = await sharp(buffer).metadata();
    if (meta.format === 'gif' && meta.pages > 1) return { data: buffer, ext: 'gif' };

    const data = await sharp(buffer)
        .rotate()
        .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
        .flatten({ background: '#ffffff' })
        .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true })
        .toBuffer();

    return { data, ext: 'jpg' };
}

class UploadsController {
    static async create(req, res) {
        if (!TYPES[req.get('content-type')]) {
            return res.status(415).json({ message: 'Подойдёт картинка JPG, PNG, WebP, GIF или AVIF.' });
        }
        if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
            return res.status(400).json({ message: 'Файл пустой.' });
        }

        let image;
        try {
            image = await compress(req.body);
        } catch {
            return res.status(400).json({ message: 'Не получилось открыть картинку — возможно, файл повреждён.' });
        }

        // Раскладываем по месяцам, чтобы в одной папке не копились тысячи файлов
        const month = new Date().toISOString().slice(0, 7);
        const name = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString('hex')}.${image.ext}`;

        await fs.mkdir(path.join(UPLOADS_DIR, month), { recursive: true });
        await fs.writeFile(path.join(UPLOADS_DIR, month, name), image.data);

        const base = (process.env.API_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
        return res.status(201).json({ url: `${base}/uploads/${month}/${name}` });
    }
}

UploadsController.TYPES = TYPES;
UploadsController.MAX_SIZE_MB = MAX_SIZE_MB;
UploadsController.UPLOADS_DIR = UPLOADS_DIR;

module.exports = UploadsController;
