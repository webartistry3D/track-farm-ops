-- Add profileImageUrl column to users table
ALTER TABLE users ADD COLUMN profile_image_url TEXT;

-- Create index for faster queries
CREATE INDEX idx_users_profile_image_url ON users(profile_image_url) WHERE profile_image_url IS NOT NULL;
