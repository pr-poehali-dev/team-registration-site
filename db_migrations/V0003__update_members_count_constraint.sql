-- Update members_count check constraint to allow 5-7 members
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_members_count_check;
ALTER TABLE teams ADD CONSTRAINT teams_members_count_check CHECK (members_count >= 5 AND members_count <= 7);