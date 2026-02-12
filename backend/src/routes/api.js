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
    const savedSearchId = req.query.savedSearchId;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Options specifically for auction items - fetch 7 to have extras
    const options = {
      filter: 'buyingOptions:{AUCTION}',
      sort: 'endingSoonest',
      limit: 7
    };

    const results = await getEbayItemListings(query, options);

    // Update summary metrics excluding hidden listings
    if (savedSearchId && results?.itemSummaries?.length > 0) {
      const hiddenStmt = db.prepare('SELECT listingId FROM hiddenListings WHERE savedSearchId = ?');
      const hiddenListings = hiddenStmt.all(savedSearchId).map(row => row.listingId);

      // Filter for summary calculation only
      const visibleAuctions = results.itemSummaries.filter(item => !hiddenListings.includes(item.itemId));

      // Update database with the first non-hidden auction
      if (visibleAuctions.length > 0) {
        const nextAuction = visibleAuctions[0];
        const currentPrice = nextAuction.currentBidPrice?.value || nextAuction.price?.value;
        const endDate = nextAuction.itemEndDate;
        const link = nextAuction.itemWebUrl;

        if (currentPrice && endDate && link) {
          try {
            db.prepare(`
              UPDATE savedSearches
              SET nextAuctionCurrentPrice = ?,
                  nextAuctionLink = ?,
                  nextAuctionEndAt = ?,
                  nextAuctionUpdatedAt = CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(Math.round(parseFloat(currentPrice)), link, endDate, savedSearchId);
          } catch (dbError) {
            console.error('Error updating auction data:', dbError);
          }
        }
      }
    }

    // Return all results (including hidden ones)
    res.json({ results });
  } catch (error) {
    console.error('Error fetching eBay auction results:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/itemBinsInfo', async (req, res) => {
  try {
    const query = req.query.query;
    const savedSearchId = req.query.savedSearchId;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Options specifically for buy it now items - fetch 7 to have extras
    const options = {
      filter: 'buyingOptions:{FIXED_PRICE}',
      sort: 'price',
      limit: 7
    };

    const results = await getEbayItemListings(query, options);

    // Update summary metrics excluding hidden listings
    if (savedSearchId && results?.itemSummaries?.length > 0) {
      const hiddenStmt = db.prepare('SELECT listingId FROM hiddenListings WHERE savedSearchId = ?');
      const hiddenListings = hiddenStmt.all(savedSearchId).map(row => row.listingId);

      // Filter for summary calculation only
      const visibleBins = results.itemSummaries.filter(item => !hiddenListings.includes(item.itemId));

      // Update database with the lowest non-hidden BIN
      if (visibleBins.length > 0) {
        const lowestBinItem = visibleBins[0];
        const lowestPrice = lowestBinItem.price?.value;
        const link = lowestBinItem.itemWebUrl;

        if (lowestPrice && link) {
          try {
            db.prepare(`
              UPDATE savedSearches
              SET lowestBin = ?,
                  lowestBinLink = ?,
                  lowestBinUpdatedAt = CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(Math.round(parseFloat(lowestPrice)), link, savedSearchId);
          } catch (dbError) {
            console.error('Error updating BIN data:', dbError);
          }
        }
      }
    }

    // Return all results (including hidden ones)
    res.json({ results });
  } catch (error) {
    console.error('Error fetching eBay buy it now results:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/itemSalesInfo', async (req, res) => {
  try {
    const query = req.query.query;
    const savedSearchId = req.query.savedSearchId;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const itemSales = await getItemSales(query);

    // Update database if savedSearchId is provided and we have sales
    if (savedSearchId && itemSales?.length > 0) {
      const mostRecentSale = itemSales[0];
      const salePrice = mostRecentSale.price?.value;
      const saleDate = mostRecentSale.saleDate;
      const link = mostRecentSale.itemWebUrl;

      if (salePrice && link) {
        try {
          db.prepare(`
            UPDATE savedSearches
            SET lastSale = ?,
                lastSaleLink = ?,
                lastSaleOccurredAt = ?,
                lastSaleUpdatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(Math.round(parseFloat(salePrice)), link, saleDate || null, savedSearchId);
        } catch (dbError) {
          console.error('Error updating sales data:', dbError);
        }
      }
    }

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
    const {
      query,
      lastSale,
      lastSaleLink,
      lastSaleOccurredAt,
      lowestBin,
      lowestBinLink,
      nextAuctionCurrentPrice,
      nextAuctionLink,
      nextAuctionEndAt
    } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Insert the search query with initial summary data
    const stmt = db.prepare(`
      INSERT INTO savedSearches (
        query,
        lastSale,
        lastSaleLink,
        lastSaleOccurredAt,
        lastSaleUpdatedAt,
        lowestBin,
        lowestBinLink,
        lowestBinUpdatedAt,
        nextAuctionCurrentPrice,
        nextAuctionLink,
        nextAuctionEndAt,
        nextAuctionUpdatedAt
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    const result = stmt.run(
      query.trim(),
      lastSale || null,
      lastSaleLink || null,
      lastSaleOccurredAt || null,
      lowestBin || null,
      lowestBinLink || null,
      nextAuctionCurrentPrice || null,
      nextAuctionLink || null,
      nextAuctionEndAt || null
    );

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

router.post('/hiddenListing', async (req, res) => {
  try {
    const { savedSearchId, listingId } = req.body;

    if (!savedSearchId || !listingId) {
      return res.status(400).json({ error: 'savedSearchId and listingId are required' });
    }

    // Insert the hidden listing
    const stmt = db.prepare(`
      INSERT INTO hiddenListings (savedSearchId, listingId)
      VALUES (?, ?)
    `);
    const result = stmt.run(savedSearchId, listingId);

    res.json({
      success: true,
      id: result.lastInsertRowid,
      savedSearchId,
      listingId
    });
  } catch (error) {
    // Handle unique constraint violation (already hidden)
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: 'Listing already hidden' });
    }

    console.error('Error hiding listing:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/hiddenListing', async (req, res) => {
  try {
    const { savedSearchId, listingId } = req.body;

    if (!savedSearchId || !listingId) {
      return res.status(400).json({ error: 'savedSearchId and listingId are required' });
    }

    // Delete the hidden listing
    const stmt = db.prepare('DELETE FROM hiddenListings WHERE savedSearchId = ? AND listingId = ?');
    const result = stmt.run(savedSearchId, listingId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Hidden listing not found' });
    }

    res.json({
      success: true,
      savedSearchId,
      listingId
    });
  } catch (error) {
    console.error('Error unhiding listing:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/hiddenListings', async (req, res) => {
  try {
    const savedSearchId = req.query.savedSearchId;

    if (!savedSearchId) {
      return res.status(400).json({ error: 'savedSearchId is required' });
    }

    const stmt = db.prepare('SELECT listingId FROM hiddenListings WHERE savedSearchId = ?');
    const hiddenListings = stmt.all(savedSearchId);

    res.json({ hiddenListings: hiddenListings.map(row => row.listingId) });
  } catch (error) {
    console.error('Error fetching hidden listings:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
