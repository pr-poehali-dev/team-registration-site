CREATE TABLE IF NOT EXISTS t_p68536388_team_registration_si.telegram_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    chat_id BIGINT NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_telegram_users_username ON t_p68536388_team_registration_si.telegram_users(username);
CREATE INDEX IF NOT EXISTS idx_telegram_users_chat_id ON t_p68536388_team_registration_si.telegram_users(chat_id);
