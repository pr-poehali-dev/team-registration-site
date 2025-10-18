-- Создание таблицы для хранения матчей турнирной сетки
CREATE TABLE IF NOT EXISTS t_p68536388_team_registration_si.matches (
    id SERIAL PRIMARY KEY,
    match_number INTEGER NOT NULL UNIQUE,
    bracket_type VARCHAR(20) NOT NULL CHECK (bracket_type IN ('upper', 'lower', 'grand_final')),
    round_number INTEGER NOT NULL,
    team1_id INTEGER REFERENCES t_p68536388_team_registration_si.teams(id),
    team2_id INTEGER REFERENCES t_p68536388_team_registration_si.teams(id),
    team1_placeholder VARCHAR(100),
    team2_placeholder VARCHAR(100),
    score1 INTEGER,
    score2 INTEGER,
    winner INTEGER CHECK (winner IN (1, 2)),
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished')),
    scheduled_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX idx_matches_bracket_round ON t_p68536388_team_registration_si.matches(bracket_type, round_number);
CREATE INDEX idx_matches_status ON t_p68536388_team_registration_si.matches(status);

-- Комментарии
COMMENT ON TABLE t_p68536388_team_registration_si.matches IS 'Матчи турнирной сетки';
COMMENT ON COLUMN t_p68536388_team_registration_si.matches.match_number IS 'Уникальный номер матча (как на сетке)';
COMMENT ON COLUMN t_p68536388_team_registration_si.matches.bracket_type IS 'Тип сетки: upper, lower, grand_final';
COMMENT ON COLUMN t_p68536388_team_registration_si.matches.round_number IS 'Номер раунда в сетке';
COMMENT ON COLUMN t_p68536388_team_registration_si.matches.team1_placeholder IS 'Плейсхолдер для команды 1 (например, Winner of Match 12)';
COMMENT ON COLUMN t_p68536388_team_registration_si.matches.team2_placeholder IS 'Плейсхолдер для команды 2';
