-- Статистика курсов: сколько раз открывали (views_count) и сколько разных
-- людей (readers_count). Читатель — анонимный идентификатор из браузера,
-- по одной строке на пару «курс — читатель» в course_readers.
ALTER TABLE courses
    ADD COLUMN views_count INT UNSIGNED NOT NULL DEFAULT 0 AFTER review_requested_at,
    ADD COLUMN readers_count INT UNSIGNED NOT NULL DEFAULT 0 AFTER views_count;

CREATE TABLE IF NOT EXISTS course_readers (
    course_id VARCHAR(64) NOT NULL,
    visitor_id CHAR(36) NOT NULL,
    first_seen_at DATETIME NOT NULL,
    PRIMARY KEY (course_id, visitor_id),
    CONSTRAINT course_readers_course_fk FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
