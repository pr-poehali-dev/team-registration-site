CREATE TABLE IF NOT EXISTS pending_team_changes (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    captain_name VARCHAR(255) NOT NULL,
    captain_telegram VARCHAR(100),
    members_info TEXT,
    captain_chat_id BIGINT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL
);