const ACCESS = {
    NONE: 0,
    AUTHOR: 1,
    ADMIN: 100,
};

const ACCESS_VALUES = Object.values(ACCESS);

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

module.exports = {
    ACCESS,
    ACCESS_VALUES,
    ADMIN_EMAILS,
};
