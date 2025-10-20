-- Add telegram column to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS captain_telegram VARCHAR(255);