-- Добавление уникального индекса для captain_telegram
-- Один человек может зарегистрировать только одну команду

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_captain_telegram 
ON t_p68536388_team_registration_si.teams(captain_telegram);