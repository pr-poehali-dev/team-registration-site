-- Добавление суперадминистратора @Rywrxuna
INSERT INTO t_p68536388_team_registration_si.admin_users 
(username, password_hash, telegram_chat_id, telegram_username, is_active, created_at)
VALUES 
('@Rywrxuna', '8f3e5d4c7a2b1f9e6d8c4a3b2e1f7d9c8b6a5e4d3c2b1a9f8e7d6c5b4a3e2d1c', NULL, NULL, true, CURRENT_TIMESTAMP)
ON CONFLICT (username) DO UPDATE 
SET password_hash = EXCLUDED.password_hash,
    is_active = EXCLUDED.is_active;