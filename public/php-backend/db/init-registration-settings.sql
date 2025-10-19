-- ================================================
-- Инициализация таблицы registration_settings
-- ================================================
-- 
-- Назначение:
-- Создаёт таблицу для управления статусом регистрации
-- и добавляет начальную запись (регистрация открыта)
--
-- Использование:
-- 1. Открыть phpMyAdmin
-- 2. Выбрать базу ce876244_tournam
-- 3. Вкладка SQL
-- 4. Скопировать и выполнить этот скрипт
--
-- ================================================

-- Создать таблицу (если её ещё нет)
CREATE TABLE IF NOT EXISTS registration_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    is_open BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Регистрация открыта?',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Когда изменено',
    updated_by VARCHAR(255) COMMENT 'Кем изменено (admin, system)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Настройки регистрации команд';

-- Добавить начальную запись (только если таблица пуста)
INSERT INTO registration_settings (is_open, updated_by)
SELECT TRUE, 'system'
WHERE NOT EXISTS (SELECT 1 FROM registration_settings);

-- Проверка результата
SELECT 
    id,
    is_open AS 'Регистрация открыта',
    updated_at AS 'Обновлено',
    updated_by AS 'Кем'
FROM registration_settings
ORDER BY updated_at DESC
LIMIT 1;

-- ================================================
-- Результат выполнения:
-- ================================================
-- 
-- ✅ Таблица создана
-- ✅ Добавлена запись: is_open = TRUE
-- ✅ Регистрация ОТКРЫТА по умолчанию
-- 
-- ================================================
