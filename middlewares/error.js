function errorHandler(err, req, res, next) {
    if (res.headersSent) return next(err);

    if (err.type === 'entity.too.large') {
        return res.status(413).json({ message: req.path === '/uploads' ? 'Фото больше 10 МБ — уменьшите его.' : 'Слишком большой запрос.' });
    }

    if (err.status >= 400 && err.status < 500) {
        return res.status(err.status).json({ message: 'Некорректный запрос.' });
    }

    console.error(err);
    return res.status(500).json({ message: 'Ошибка сервера. Попробуйте позже.' });
}

module.exports = errorHandler;
