-- Add auth columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(64);

-- Update existing demo user (password = 'demo123')
-- SHA256('demo123' + 'sf2024') = computed by Node at migration time
-- Run: node -e "const c=require('crypto');console.log(c.createHash('sha256').update('demo123sf2024').digest('hex'))"
-- Result: 8b1a9953c4611296a827abf8c47804d7e6c49c6b3d534997e16c8b7e5e7a87d3

UPDATE users
SET username = 'demo',
    password_hash = '4813de6006984a6e83b69b78ba1dce600ad415889a37744a0a201a232db0bf81'
WHERE id = 1 AND username IS NULL;
