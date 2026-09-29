-- Модерация курсов: автор (доступ 1) не публикует курс сам, а отправляет
-- его на проверку. Здесь — когда отправил; NULL — проверки не ждёт.
ALTER TABLE courses ADD COLUMN review_requested_at DATETIME NULL AFTER pages;
