import express from 'express';
import { getEbayItemListings } from '../utils/ebay.js';
import { getItemSales } from '../utils/sales.js';
import db from '../db/database.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is healthy' });
});

router.get('/itemAuctionsInfo', async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Options specifically for auction items
    const options = {
      filter: 'buyingOptions:{AUCTION}',
      sort: 'endingSoonest',
      limit: req.query.limit || 3
    };

    const results = await getEbayItemListings(query, options);
    res.json({ results });
  } catch (error) {
    console.error('Error fetching eBay auction results:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/itemBinsInfo', async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Options specifically for buy it now items
    const options = {
      filter: 'buyingOptions:{FIXED_PRICE}',
      sort: 'price',
      limit: req.query.limit || 5
    };

    const results = await getEbayItemListings(query, options);
    res.json({ results });
  } catch (error) {
    console.error('Error fetching eBay buy it now results:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/itemSalesInfo', async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const itemSales = await getItemSales(query);
    res.json({ itemSales });
  } catch (error) {
    console.error('Error fetching Alt.xyz sales:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/savedSearches', async (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM savedSearches ORDER BY createdAt DESC');
    const searches = stmt.all();

    res.json({ searches });
  } catch (error) {
    console.error('Error fetching saved searches:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/savedSearch', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Insert the search query into the database
    const stmt = db.prepare('INSERT INTO savedSearches (query) VALUES (?)');
    const result = stmt.run(query.trim());

    res.json({
      success: true,
      id: result.lastInsertRowid,
      query: query.trim()
    });
  } catch (error) {
    // Handle unique constraint violation (duplicate query)
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: 'Search query already saved' });
    }

    console.error('Error saving search:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/savedSearch', async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    // Delete the search query from the database by ID
    const stmt = db.prepare('DELETE FROM savedSearches WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Search not found' });
    }

    res.json({
      success: true,
      id: id,
      deleted: true
    });
  } catch (error) {
    console.error('Error deleting search:', error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/itemCost', async (req, res) => {
  try {
    const { id, cost } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    if (cost === undefined || cost === null) {
      return res.status(400).json({ error: 'Cost is required' });
    }

    // Update the cost for the saved search
    const stmt = db.prepare('UPDATE savedSearches SET cost = ? WHERE id = ?');
    const result = stmt.run(cost, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Search not found' });
    }

    res.json({
      success: true,
      id: id,
      cost: cost
    });
  } catch (error) {
    console.error('Error updating cost:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/resetDatabase', async (req, res) => {
  try {
    // Delete all records from savedSearches table
    const stmt = db.prepare('DELETE FROM savedSearches');
    stmt.run();

    // Reset the autoincrement counter
    db.prepare('DELETE FROM sqlite_sequence WHERE name = ?').run('savedSearches');

    res.json({
      success: true,
      message: 'Database reset successfully'
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
