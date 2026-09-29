CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(120) NOT NULL DEFAULT '',
    access SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    last_login_at DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY users_email_unique (email),
    KEY users_access_index (access)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS codes (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    code_hash CHAR(64) NOT NULL,
    attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    KEY codes_email_index (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(64) NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(500) NOT NULL DEFAULT '',
    accent VARCHAR(32) NOT NULL DEFAULT 'mint',
    section VARCHAR(32) NOT NULL,
    difficulty TINYINT UNSIGNED NOT NULL DEFAULT 1,
    disabled TINYINT(1) NOT NULL DEFAULT 1,
    level VARCHAR(100) NOT NULL DEFAULT '',
    duration VARCHAR(100) NOT NULL DEFAULT '',
    image VARCHAR(500) NULL,
    video VARCHAR(500) NULL,
    chips JSON NOT NULL,
    github VARCHAR(500) NULL,
    author JSON NULL,
    certificate VARCHAR(500) NULL,
    about JSON NOT NULL,
    pages JSON NOT NULL,
    -- Автор отправил курс на проверку; NULL — проверки не ждёт
    review_requested_at DATETIME NULL,
    -- Статистика: открытия курса и разные читатели (см. course_readers)
    views_count INT UNSIGNED NOT NULL DEFAULT 0,
    readers_count INT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    KEY courses_user_index (user_id),
    CONSTRAINT courses_user_fk FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Кто уже читал курс: одна строка на пару «курс — анонимный читатель»
CREATE TABLE IF NOT EXISTS course_readers (
    course_id VARCHAR(64) NOT NULL,
    visitor_id CHAR(36) NOT NULL,
    first_seen_at DATETIME NOT NULL,
    PRIMARY KEY (course_id, visitor_id),
    CONSTRAINT course_readers_course_fk FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
