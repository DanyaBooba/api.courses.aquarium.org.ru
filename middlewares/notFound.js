function notFound(req, res) {
    return res.status(404).json({ message: 'Не найдено.' });
}

module.exports = notFound;
