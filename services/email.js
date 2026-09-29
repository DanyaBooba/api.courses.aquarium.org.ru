const nodemailer = require('nodemailer');

const codeEmail = require('../templates-email/code');
const adminNewUserEmail = require('../templates-email/adminNewUser');
const accessGrantedEmail = require('../templates-email/accessGranted');
const reviewRequestedEmail = require('../templates-email/reviewRequested');
const coursePublishedEmail = require('../templates-email/coursePublished');
const reviewDeclinedEmail = require('../templates-email/reviewDeclined');
const { ADMIN_EMAILS } = require('../config/access');

const transporter = process.env.EMAIL_HOST
    ? nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT || 465),
        secure: process.env.EMAIL_SECURE !== 'false',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    })
    : null;

class EmailService {
    static async send(to, subject, html) {
        if (!transporter || process.env.APP_ENV === 'localhost') {
            console.log(`[email] ${to}: ${subject}`);
            return;
        }

        await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'courses.dybka.ru'}" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
    }

    static async notify(to, subject, html) {
        try {
            await EmailService.send(to, subject, html);
        } catch (error) {
            console.error(`Не удалось отправить письмо «${subject}»:`, error.message);
        }
    }

    static async sendCode(to, code, lifetimeMin) {
        await EmailService.send(to, `${code} — код для входа`, codeEmail({ code, lifetimeMin }));
    }

    static async sendAdminNewUser(user) {
        const html = adminNewUserEmail({ email: user.email, createdAt: user.created_at });
        await Promise.all(
            ADMIN_EMAILS.map((admin) => EmailService.notify(admin, 'Новый автор ждёт подтверждения', html))
        );
    }

    static async sendAccessGranted(user) {
        await EmailService.notify(user.email, 'Доступ открыт', accessGrantedEmail({ name: user.name }));
    }

    /** `admins` — почты администраторов: из ADMIN_EMAILS и из базы. */
    static async sendReviewRequested(admins, course, author) {
        const html = reviewRequestedEmail({ course, author });
        const to = [...new Set([...ADMIN_EMAILS, ...admins.map((email) => email.toLowerCase())])];
        await Promise.all(to.map((admin) => EmailService.notify(admin, `Курс ждёт проверки: ${course.title}`, html)));
    }

    static async sendCoursePublished(owner, course) {
        await EmailService.notify(owner.email, `Курс опубликован: ${course.title}`, coursePublishedEmail({ course }));
    }

    static async sendReviewDeclined(owner, course, reason) {
        await EmailService.notify(owner.email, `Курс пока не опубликован: ${course.title}`, reviewDeclinedEmail({ course, reason }));
    }
}

module.exports = EmailService;
