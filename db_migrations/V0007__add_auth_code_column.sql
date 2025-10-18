ALTER TABLE t_p68536388_team_registration_si.teams 
ADD COLUMN IF NOT EXISTS auth_code VARCHAR(6) NOT NULL DEFAULT substring(md5(random()::text) from 1 for 6);