const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const coursesRoutes = require('./routes/courses');
const adminRoutes = require('./routes/admin');
const uploadsRoutes = require('./routes/uploads');
const UploadsController = require('./controllers/uploads');
const SitemapController = require('./controllers/sitemap');
const errorHandler = require('./middlewares/error');
const notFound = require('./middlewares/notFound');

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

function createApp() {
    const app = express();

    app.set('trust proxy', 1);
    // Картинки из /uploads показываются на сайте — с другого домена
    app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
    app.use(cors({ origin: allowedOrigins }));

    // Имена загруженных файлов уникальны, поэтому кэшировать их можно навсегда.
    // Стоит до no-store ниже, чтобы тот не перебил кэш
    app.use('/uploads', express.static(UploadsController.UPLOADS_DIR, { maxAge: '365d', immutable: true }));

    app.use(express.json({ limit: '2mb' }));

    app.use((req, res, next) => {
        res.setHeader('Cache-Control', 'no-store');
        next();
    });

    app.get('/health', (req, res) => res.json({ status: 'ok' }));
    app.get('/sitemap.xml', SitemapController.show);

    app.use(authRoutes);
    app.use(profileRoutes);
    app.use(coursesRoutes);
    app.use(uploadsRoutes);
    app.use('/admin', adminRoutes);

    app.use(notFound);
    app.use(errorHandler);

    return app;
}

module.exports = createApp;
