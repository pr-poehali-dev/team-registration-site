-- Database dump for project
-- Generated: 2025-10-19
-- Schema: t_p68536388_team_registration_si

-- Create schema
CREATE SCHEMA IF NOT EXISTS t_p68536388_team_registration_si;

-- =====================================================
-- Table: admin_users
-- =====================================================
CREATE TABLE IF NOT EXISTS t_p68536388_team_registration_si.admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telegram_chat_id BIGINT,
    telegram_username VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

INSERT INTO t_p68536388_team_registration_si.admin_users (id, username, password_hash, telegram_chat_id, telegram_username, is_active, created_at, last_login) VALUES
(1, '@Rywrxuna', '7e45e9698d89fc03a9012fa25e87a37ccf7154f623c4a49c1e8df294f30ad7c9', 825825949, 'Rywrxuna', true, '2025-10-18 20:58:44.630152', '2025-10-19 13:06:32.628653'),
(4, '@Rywrsupport', '896858bcd5380a3b8899f3a003c7752ead68da179210133ac3f2345b987b4fcc', 825825949, 'Rywrxuna', true, '2025-10-18 21:46:44.969335', NULL);

SELECT setval('t_p68536388_team_registration_si.admin_users_id_seq', 4, true);

-- =====================================================
-- Table: telegram_users
-- =====================================================
CREATE TABLE IF NOT EXISTS t_p68536388_team_registration_si.telegram_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    chat_id BIGINT NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO t_p68536388_team_registration_si.telegram_users (id, username, chat_id, first_name, last_name, created_at, updated_at) VALUES
(1, 'Rywrxuna', 825825949, 'Xυнα', 'Twitch', '2025-10-18 20:33:09.366916', '2025-10-19 13:05:37.592424'),
(21, 'testuser', 12345, 'Test', '', '2025-10-18 23:52:12.123567', '2025-10-18 23:53:22.655325');

SELECT setval('t_p68536388_team_registration_si.telegram_users_id_seq', 21, true);

-- =====================================================
-- Table: teams
-- =====================================================
CREATE TABLE IF NOT EXISTS t_p68536388_team_registration_si.teams (
    id SERIAL PRIMARY KEY,
    team_name VARCHAR(255) NOT NULL,
    captain_name VARCHAR(255) NOT NULL,
    captain_email VARCHAR(255) NOT NULL,
    captain_phone VARCHAR(50),
    members_count INTEGER NOT NULL,
    members_info TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    admin_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    captain_telegram VARCHAR(255),
    auth_code VARCHAR(20) NOT NULL DEFAULT SUBSTRING(md5(random()::text) FROM 1 FOR 6),
    current_status VARCHAR(50) DEFAULT 'waiting',
    bracket_url TEXT,
    status_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Table: matches
-- =====================================================
CREATE TABLE IF NOT EXISTS t_p68536388_team_registration_si.matches (
    id SERIAL PRIMARY KEY,
    match_number INTEGER NOT NULL,
    bracket_type VARCHAR(20) NOT NULL,
    round_number INTEGER NOT NULL,
    team1_id INTEGER REFERENCES t_p68536388_team_registration_si.teams(id),
    team2_id INTEGER REFERENCES t_p68536388_team_registration_si.teams(id),
    team1_placeholder VARCHAR(100),
    team2_placeholder VARCHAR(100),
    score1 INTEGER,
    score2 INTEGER,
    winner INTEGER,
    status VARCHAR(20) DEFAULT 'upcoming',
    scheduled_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Table: registration_settings
-- =====================================================
CREATE TABLE IF NOT EXISTS t_p68536388_team_registration_si.registration_settings (
    id SERIAL PRIMARY KEY,
    is_open BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100)
);

INSERT INTO t_p68536388_team_registration_si.registration_settings (id, is_open, updated_at, updated_by) VALUES
(1, true, '2025-10-18 18:44:32.209607', 'system'),
(2, false, '2025-10-18 18:45:17.049198', 'test_admin'),
(3, true, '2025-10-18 18:57:29.791854', 'admin'),
(4, false, '2025-10-18 19:04:58.127622', 'admin'),
(5, true, '2025-10-18 19:10:43.349081', 'admin'),
(6, false, '2025-10-18 21:37:18.126661', 'admin'),
(7, true, '2025-10-18 23:42:47.513418', 'admin');

SELECT setval('t_p68536388_team_registration_si.registration_settings_id_seq', 7, true);

-- =====================================================
-- Table: pending_actions
-- =====================================================
CREATE TABLE IF NOT EXISTS t_p68536388_team_registration_si.pending_actions (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    action_data JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
);

INSERT INTO t_p68536388_team_registration_si.pending_actions (id, team_id, action_type, action_data, status, created_at, expires_at) VALUES
(6, 256, 'update', '{"team_name": "хина", "captain_name": "jenenejen", "members_info": "Топ: ybrb - Телеграм: XunaYt\nЛес: тишишри - Телеграм: XunaYt\nМид: иишишл - Телеграм: XunaYt\nАДК: иррр - Телеграм: XunaYt\nСаппорт: рргршрш - Телеграм: RYWRXuna", "captain_telegram": "@RYWRXuna"}', 'pending', '2025-10-19 13:04:07.331565', '2025-10-20 13:04:07.331565'),
(7, 256, 'update', '{"team_name": "хина", "captain_name": "jenenejen", "members_info": "Топ: ybrb - Телеграм: XunaYt\nЛес: тишишри - Телеграм: XunaYt\nМид: иишишл - Телеграм: XunaYt\nАДК: иррр - Телеграм: XunaYt\nСаппорт: рргршрш - Телеграм: RYWRXuna", "captain_telegram": "@RYWRXuna"}', 'pending', '2025-10-19 13:04:42.045614', '2025-10-20 13:04:42.045614');

SELECT setval('t_p68536388_team_registration_si.pending_actions_id_seq', 7, true);

-- =====================================================
-- End of dump
-- =====================================================
