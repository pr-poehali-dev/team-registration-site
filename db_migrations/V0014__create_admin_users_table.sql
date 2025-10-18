CREATE TABLE IF NOT EXISTS t_p68536388_team_registration_si.admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telegram_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO t_p68536388_team_registration_si.admin_users (username, password_hash, is_active)
VALUES ('@Rywrxuna', 'dummy_hash', TRUE)
ON CONFLICT (username) DO NOTHING;
