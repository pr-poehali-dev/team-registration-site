-- Увеличиваем длину поля auth_code для формата REG-XXXX-XXXX
ALTER TABLE t_p68536388_team_registration_si.teams 
ALTER COLUMN auth_code TYPE character varying(20);

-- Обновляем существующие коды на формат REG-XXXX-XXXX
UPDATE t_p68536388_team_registration_si.teams
SET auth_code = CONCAT(
    'REG-',
    UPPER(SUBSTRING(MD5(RANDOM()::TEXT || id::TEXT) FROM 1 FOR 4)),
    '-',
    UPPER(SUBSTRING(MD5(RANDOM()::TEXT || created_at::TEXT) FROM 1 FOR 4))
)
WHERE LENGTH(auth_code) < 10;