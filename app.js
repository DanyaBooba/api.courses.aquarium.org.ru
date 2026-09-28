const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const coursesRoutes = require('./routes/courses');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middlewares/error');
const notFound = require('./middlewares/notFound');

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

function createApp() {
    const app = express();

    app.set('trust proxy', 1);
    app.use(helmet());
    app.use(cors({ origin: allowedOrigins }));
    app.use(express.json({ limit: '2mb' }));

    app.use((req, res, next) => {
        res.setHeader('Cache-Control', 'no-store');
        next();
    });

    app.get('/health', (req, res) => res.json({ status: 'ok' }));

    app.use(authRoutes);
    app.use(profileRoutes);
    app.use(coursesRoutes);
    app.use('/admin', adminRoutes);

    app.use(notFound);
    app.use(errorHandler);

    return app;
}

module.exports = createApp;
