-- Migration number: 0008 	 2026-02-03T00:00:00.000Z
-- Remove deprecated pageIdDict column from tags table
-- This column was replaced by page_tags junction table in migration 0006

-- Step 1: Create new table without pageIdDict column
CREATE TABLE tags_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#FFFFFF',
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Copy data from old table to new table
INSERT INTO tags_new (id, name, color, createdAt, updatedAt)
SELECT id, name, color, createdAt, updatedAt FROM tags;

-- Step 3: Drop old table
DROP TABLE tags;

-- Step 4: Rename new table to original name
ALTER TABLE tags_new RENAME TO tags;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_tags_id ON tags(id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
