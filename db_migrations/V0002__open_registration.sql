-- Открыть регистрацию команд
UPDATE t_p68536388_team_registration_si.registration_settings 
SET is_open = true, updated_at = NOW(), updated_by = 'system' 
WHERE id = (SELECT id FROM t_p68536388_team_registration_si.registration_settings ORDER BY updated_at DESC LIMIT 1);
