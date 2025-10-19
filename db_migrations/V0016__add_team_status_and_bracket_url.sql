-- Добавляем поля для статуса команды и ссылки на турнирную сетку
ALTER TABLE t_p68536388_team_registration_si.teams 
ADD COLUMN IF NOT EXISTS current_status VARCHAR(50) DEFAULT 'waiting',
ADD COLUMN IF NOT EXISTS bracket_url TEXT,
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Создаем индекс для быстрого поиска по статусу
CREATE INDEX IF NOT EXISTS idx_teams_current_status ON t_p68536388_team_registration_si.teams(current_status);

COMMENT ON COLUMN t_p68536388_team_registration_si.teams.current_status IS 'Текущий статус: waiting (ожидание), streaming (на стриме), playing (играют), finished (завершили)';
COMMENT ON COLUMN t_p68536388_team_registration_si.teams.bracket_url IS 'Ссылка на турнирную сетку';
COMMENT ON COLUMN t_p68536388_team_registration_si.teams.status_updated_at IS 'Время последнего обновления статуса';