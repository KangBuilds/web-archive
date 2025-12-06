-- Migration number: 0005 	 2025-12-06T00:00:00.000Z
-- Add performance indexes for pages query optimization

-- Composite index for common query pattern (folderId + isDeleted + createdAt)
-- This covers: WHERE folderId = ? AND isDeleted = 0 ORDER BY createdAt DESC
CREATE INDEX IF NOT EXISTS idx_pages_folder_deleted_created 
ON pages(folderId, isDeleted, createdAt DESC);

-- Composite index for queries without folder filter
-- This covers: WHERE isDeleted = 0 ORDER BY createdAt DESC
CREATE INDEX IF NOT EXISTS idx_pages_deleted_created 
ON pages(isDeleted, createdAt DESC);

-- Index for createdAt alone (useful for recent saves query)
CREATE INDEX IF NOT EXISTS idx_pages_created 
ON pages(createdAt DESC);
