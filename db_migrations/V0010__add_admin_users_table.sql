CREATE TABLE IF NOT EXISTS t_p68536388_team_registration_si.admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telegram_chat_id BIGINT,
    telegram_username VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX idx_admin_users_username ON t_p68536388_team_registration_si.admin_users(username);
CREATE INDEX idx_admin_users_telegram_chat_id ON t_p68536388_team_registration_si.admin_users(telegram_chat_id);
