-- Обновление пароля суперадминистратора с правильным хешем
UPDATE t_p68536388_team_registration_si.admin_users 
SET password_hash = 'a8f3e5c9d2b7f1e4a6c8b3d5e9f2a7c1b8d4e6f9a2c5b7d1e3f8a4c6b9d2e5f1'
WHERE username = '@Rywrxuna';