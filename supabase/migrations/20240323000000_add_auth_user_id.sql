-- Add auth_user_id field to users table to link with Supabase Auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- Update existing users to have auth_user_id if they don't have it
-- This is a placeholder for existing data migration if needed 