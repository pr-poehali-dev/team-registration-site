-- Database dump for MySQL
-- Generated: 2025-10-19
-- Converted from PostgreSQL to MySQL

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- =====================================================
-- Table: admin_users
-- =====================================================
CREATE TABLE IF NOT EXISTS `admin_users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(100) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `telegram_chat_id` BIGINT DEFAULT NULL,
    `telegram_username` VARCHAR(100) DEFAULT NULL,
    `is_active` BOOLEAN DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `last_login` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `admin_users` (`id`, `username`, `password_hash`, `telegram_chat_id`, `telegram_username`, `is_active`, `created_at`, `last_login`) VALUES
(1, '@Rywrxuna', '7e45e9698d89fc03a9012fa25e87a37ccf7154f623c4a49c1e8df294f30ad7c9', 825825949, 'Rywrxuna', 1, '2025-10-18 20:58:44', '2025-10-19 13:06:32'),
(4, '@Rywrsupport', '896858bcd5380a3b8899f3a003c7752ead68da179210133ac3f2345b987b4fcc', 825825949, 'Rywrxuna', 1, '2025-10-18 21:46:44', NULL);

-- =====================================================
-- Table: telegram_users
-- =====================================================
CREATE TABLE IF NOT EXISTS `telegram_users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(255) NOT NULL,
    `chat_id` BIGINT NOT NULL,
    `first_name` VARCHAR(255) DEFAULT NULL,
    `last_name` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `telegram_users` (`id`, `username`, `chat_id`, `first_name`, `last_name`, `created_at`, `updated_at`) VALUES
(1, 'Rywrxuna', 825825949, 'Xυнα', 'Twitch', '2025-10-18 20:33:09', '2025-10-19 13:05:37'),
(21, 'testuser', 12345, 'Test', '', '2025-10-18 23:52:12', '2025-10-18 23:53:22');

-- =====================================================
-- Table: teams
-- =====================================================
CREATE TABLE IF NOT EXISTS `teams` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `team_name` VARCHAR(255) NOT NULL,
    `captain_name` VARCHAR(255) NOT NULL,
    `captain_email` VARCHAR(255) NOT NULL,
    `captain_phone` VARCHAR(50) DEFAULT NULL,
    `members_count` INT NOT NULL,
    `members_info` TEXT DEFAULT NULL,
    `status` VARCHAR(50) DEFAULT 'pending',
    `admin_comment` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `captain_telegram` VARCHAR(255) DEFAULT NULL,
    `auth_code` VARCHAR(20) NOT NULL DEFAULT (SUBSTRING(MD5(RAND()), 1, 6)),
    `current_status` VARCHAR(50) DEFAULT 'waiting',
    `bracket_url` TEXT DEFAULT NULL,
    `status_updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Table: matches
-- =====================================================
CREATE TABLE IF NOT EXISTS `matches` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `match_number` INT NOT NULL,
    `bracket_type` VARCHAR(20) NOT NULL,
    `round_number` INT NOT NULL,
    `team1_id` INT DEFAULT NULL,
    `team2_id` INT DEFAULT NULL,
    `team1_placeholder` VARCHAR(100) DEFAULT NULL,
    `team2_placeholder` VARCHAR(100) DEFAULT NULL,
    `score1` INT DEFAULT NULL,
    `score2` INT DEFAULT NULL,
    `winner` INT DEFAULT NULL,
    `status` VARCHAR(20) DEFAULT 'upcoming',
    `scheduled_time` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`team1_id`) REFERENCES `teams`(`id`),
    FOREIGN KEY (`team2_id`) REFERENCES `teams`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Table: registration_settings
-- =====================================================
CREATE TABLE IF NOT EXISTS `registration_settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `is_open` BOOLEAN NOT NULL DEFAULT 1,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `updated_by` VARCHAR(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `registration_settings` (`id`, `is_open`, `updated_at`, `updated_by`) VALUES
(1, 1, '2025-10-18 18:44:32', 'system'),
(2, 0, '2025-10-18 18:45:17', 'test_admin'),
(3, 1, '2025-10-18 18:57:29', 'admin'),
(4, 0, '2025-10-18 19:04:58', 'admin'),
(5, 1, '2025-10-18 19:10:43', 'admin'),
(6, 0, '2025-10-18 21:37:18', 'admin'),
(7, 1, '2025-10-18 23:42:47', 'admin');

-- =====================================================
-- Table: pending_actions
-- =====================================================
CREATE TABLE IF NOT EXISTS `pending_actions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `team_id` INT NOT NULL,
    `action_type` VARCHAR(20) NOT NULL,
    `action_data` JSON DEFAULT NULL,
    `status` VARCHAR(20) DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `expires_at` TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 24 HOUR)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `pending_actions` (`id`, `team_id`, `action_type`, `action_data`, `status`, `created_at`, `expires_at`) VALUES
(6, 256, 'update', '{"team_name": "хина", "captain_name": "jenenejen", "members_info": "Топ: ybrb - Телеграм: XunaYt\\nЛес: тишишри - Телеграм: XunaYt\\nМид: иишишл - Телеграм: XunaYt\\nАДК: иррр - Телеграм: XunaYt\\nСаппорт: рргршрш - Телеграм: RYWRXuna", "captain_telegram": "@RYWRXuna"}', 'pending', '2025-10-19 13:04:07', '2025-10-20 13:04:07'),
(7, 256, 'update', '{"team_name": "хина", "captain_name": "jenenejen", "members_info": "Топ: ybrb - Телеграм: XunaYt\\nЛес: тишишри - Телеграм: XunaYt\\nМид: иишишл - Телеграм: XunaYt\\nАДК: иррр - Телеграм: XunaYt\\nСаппорт: рргршрш - Телеграм: RYWRXuna", "captain_telegram": "@RYWRXuna"}', 'pending', '2025-10-19 13:04:42', '2025-10-20 13:04:42');

-- =====================================================
-- End of dump
-- =====================================================
