require('dotenv').config();

if (!process.env.TOKEN_SECRET) {
    console.error('В .env не задан TOKEN_SECRET');
    process.exit(1);
}

const createApp = require('./app');

const port = Number(process.env.PORT || 8000);

createApp().listen(port, () => {
    console.log(`API запущено на порту ${port}`);
});
