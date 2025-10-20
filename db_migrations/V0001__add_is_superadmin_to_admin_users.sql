-- Добавить поле is_superadmin в таблицу admin_users
ALTER TABLE t_p68536388_team_registration_si.admin_users 
ADD COLUMN IF NOT EXISTS is_superadmin BOOLEAN DEFAULT false;

-- Обновить первого админа как superadmin
UPDATE t_p68536388_team_registration_si.admin_users 
SET is_superadmin = true 
WHERE id = 1;
