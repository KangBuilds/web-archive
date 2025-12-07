-- Migration number: 0006 	 2025-12-06T12:00:00.000Z
-- Replace JSON-based tag storage with proper many-to-many junction table for better performance

-- Create the junction table for many-to-many relationship between pages and tags
CREATE TABLE IF NOT EXISTS page_tags (
    page_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (page_id, tag_id),
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_page_tags_page_id ON page_tags(page_id);
CREATE INDEX IF NOT EXISTS idx_page_tags_tag_id ON page_tags(tag_id);

-- Migrate existing data from JSON pageIdDict to junction table
INSERT INTO page_tags (page_id, tag_id)
SELECT 
    CAST(json_each.value AS INTEGER) as page_id,
    tags.id as tag_id
FROM tags, json_each(tags.pageIdDict)
WHERE json_each.value IS NOT NULL
ON CONFLICT DO NOTHING;

-- Remove the pageIdDict column as it's no longer needed
-- Note: SQLite doesn't support DROP COLUMN directly, so we'll keep it for backward compatibility
-- It will be ignored in the new implementation
-- In a future migration, you can recreate the table without this column if desired
