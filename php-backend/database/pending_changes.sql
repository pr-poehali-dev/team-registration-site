CREATE TABLE IF NOT EXISTS pending_team_changes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    captain_name VARCHAR(255) NOT NULL,
    captain_telegram VARCHAR(100),
    members_info TEXT,
    captain_chat_id BIGINT,
    status ENUM('pending', 'confirmed', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);
