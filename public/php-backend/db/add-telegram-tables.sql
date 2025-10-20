-- Таблица для хранения chat_id пользователей Telegram
CREATE TABLE IF NOT EXISTS telegram_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    chat_id BIGINT NOT NULL,
    first_name VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица для хранения ожидающих подтверждения изменений
CREATE TABLE IF NOT EXISTS pending_changes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    changes JSON NOT NULL,
    old_values JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Индексы для быстрого поиска
CREATE INDEX idx_telegram_username ON telegram_users(username);
CREATE INDEX idx_pending_team ON pending_changes(team_id);
