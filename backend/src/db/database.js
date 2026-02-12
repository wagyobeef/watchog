import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database file in the backend directory
const dbPath = path.join(__dirname, '../../watchog.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Create savedSearches table
db.exec(`
  CREATE TABLE IF NOT EXISTS savedSearches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL UNIQUE,
    cost INTEGER,
    costUpdatedAt DATETIME,
    lastSale INTEGER,
    lastSaleLink TEXT,
    lastSaleOccurredAt DATETIME,
    lastSaleUpdatedAt DATETIME,
    lowestBin INTEGER,
    lowestBinLink TEXT,
    lowestBinUpdatedAt DATETIME,
    nextAuctionCurrentPrice INTEGER,
    nextAuctionLink TEXT,
    nextAuctionEndAt DATETIME,
    nextAuctionUpdatedAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create hiddenListings table
db.exec(`
  CREATE TABLE IF NOT EXISTS hiddenListings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    savedSearchId INTEGER NOT NULL,
    listingId TEXT NOT NULL,
    hiddenAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (savedSearchId) REFERENCES savedSearches(id) ON DELETE CASCADE,
    UNIQUE(savedSearchId, listingId)
  )
`);

console.log('Database initialized at:', dbPath);

export default db;
