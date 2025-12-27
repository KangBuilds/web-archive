-- Migration number: 0007   2024-12-27 - Add share links table
CREATE TABLE IF NOT EXISTS share_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pageId INTEGER NOT NULL,
    shareCode TEXT NOT NULL UNIQUE,
    expiresAt DATETIME,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pageId) REFERENCES pages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_share_links_shareCode ON share_links(shareCode);
CREATE INDEX IF NOT EXISTS idx_share_links_pageId ON share_links(pageId);

