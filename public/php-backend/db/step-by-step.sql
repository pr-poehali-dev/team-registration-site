-- ============================================
-- ПОШАГОВАЯ УСТАНОВКА БАЗЫ ДАННЫХ
-- Выполняйте команды по одной в phpMyAdmin
-- ============================================

-- ВАЖНО: В phpMyAdmin слева выберите базу ce876244_tournam

-- ШАГ 1: Таблица команд
CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(255) NOT NULL,
    captain_name VARCHAR(255) NOT NULL,
    captain_telegram VARCHAR(255) NOT NULL,
    members_count INT NOT NULL,
    members_info TEXT NOT NULL,
    auth_code VARCHAR(20) UNIQUE NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ШАГ 2: Таблица администраторов
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(64) NOT NULL,
    is_superadmin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ШАГ 3: Таблица настроек
CREATE TABLE IF NOT EXISTS registration_settings (
    id INT PRIMARY KEY DEFAULT 1,
    is_open BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ШАГ 4: Таблица матчей
CREATE TABLE IF NOT EXISTS matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_number INT NOT NULL,
    bracket_type ENUM('winners', 'losers', 'grand_final') NOT NULL,
    round_number INT NOT NULL,
    team1_id INT,
    team2_id INT,
    team1_placeholder VARCHAR(255),
    team2_placeholder VARCHAR(255),
    score1 INT DEFAULT 0,
    score2 INT DEFAULT 0,
    winner INT,
    status ENUM('scheduled', 'in_progress', 'completed') DEFAULT 'scheduled',
    scheduled_time TIMESTAMP NULL,
    FOREIGN KEY (team1_id) REFERENCES teams(id) ON DELETE SET NULL,
    FOREIGN KEY (team2_id) REFERENCES teams(id) ON DELETE SET NULL,
    FOREIGN KEY (winner) REFERENCES teams(id) ON DELETE SET NULL
);

-- ШАГ 5: Таблица пользователей Telegram
CREATE TABLE IF NOT EXISTS telegram_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    chat_id BIGINT NOT NULL,
    first_name VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ШАГ 6: Таблица ожидающих изменений
CREATE TABLE IF NOT EXISTS pending_changes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    changes JSON NOT NULL,
    old_values JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- ШАГ 7: Создать индексы для быстрой работы
CREATE INDEX IF NOT EXISTS idx_telegram_username ON telegram_users(username);
CREATE INDEX IF NOT EXISTS idx_pending_team ON pending_changes(team_id);
CREATE INDEX IF NOT EXISTS idx_team_status ON teams(status);
CREATE INDEX IF NOT EXISTS idx_team_auth_code ON teams(auth_code);

-- ШАГ 8: Добавить настройки по умолчанию
INSERT IGNORE INTO registration_settings (id, is_open) VALUES (1, TRUE);

-- ШАГ 9: Создать администратора (логин: @Rywrxuna, пароль: SmirNova2468)
INSERT IGNORE INTO admin_users (username, password_hash, is_superadmin) VALUES ('@Rywrxuna', '7e45e9698d89fc03a9012fa25e87a37ccf7154f623c4a49c1e8df294f30ad7c9', TRUE);

-- ГОТОВО! Проверьте что все таблицы созданы