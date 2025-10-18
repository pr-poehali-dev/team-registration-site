CREATE TABLE IF NOT EXISTS t_p68536388_team_registration_si.pending_actions (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    action_data JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '24 hours'
);

CREATE INDEX idx_pending_actions_team_id ON t_p68536388_team_registration_si.pending_actions(team_id);
CREATE INDEX idx_pending_actions_status ON t_p68536388_team_registration_si.pending_actions(status);
