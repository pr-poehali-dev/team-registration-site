-- Создание таблицы для хранения настроек регистрации
-- Храним статус регистрации (открыта/закрыта)

CREATE TABLE IF NOT EXISTS t_p68536388_team_registration_si.registration_settings (
    id SERIAL PRIMARY KEY,
    is_open BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100)
);

-- Вставляем начальное значение (регистрация открыта)
INSERT INTO t_p68536388_team_registration_si.registration_settings (is_open, updated_by)
VALUES (true, 'system')
ON CONFLICT DO NOTHING;