import express, { Request, Response } from 'express';
import { getEbayItemListings } from '../utils/ebay.js';
import { getItemSales } from '../utils/sales.js';
import db from '../db/database.js';

const router = express.Router();

router.get('/itemAuctionsInfo', async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    const savedSearchId = req.query.savedSearchId as string;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const options = {
      filter: 'buyingOptions:{AUCTION}',
      sort: 'endingSoonest',
      limit: 7
    };

    const results = await getEbayItemListings(query, options);

    // Update summary metrics excluding hidden listings
    if (savedSearchId && results?.itemSummaries?.length > 0) {
      const hiddenStmt = db.prepare('SELECT listingId FROM hiddenListings WHERE savedSearchId = ?');
      const hiddenListings = hiddenStmt.all(savedSearchId).map((row: any) => row.listingId);

      const visibleAuctions = results.itemSummaries.filter((item: any) => !hiddenListings.includes(item.itemId));

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

    res.json({ results });
  } catch (error: any) {
    console.error('Error fetching eBay auction results:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/itemBinsInfo', async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    const savedSearchId = req.query.savedSearchId as string;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const options = {
      filter: 'buyingOptions:{FIXED_PRICE}',
      sort: 'price',
      limit: 7
    };

    const results = await getEbayItemListings(query, options);

    // Update summary metrics excluding hidden listings
    if (savedSearchId && results?.itemSummaries?.length > 0) {
      const hiddenStmt = db.prepare('SELECT listingId FROM hiddenListings WHERE savedSearchId = ?');
      const hiddenListings = hiddenStmt.all(savedSearchId).map((row: any) => row.listingId);

      const visibleBins = results.itemSummaries.filter((item: any) => !hiddenListings.includes(item.itemId));

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

    res.json({ results });
  } catch (error: any) {
    console.error('Error fetching eBay buy it now results:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/itemSalesInfo', async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    const savedSearchId = req.query.savedSearchId as string;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const itemSales = await getItemSales(query);

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
  } catch (error: any) {
    console.error('Error fetching Alt.xyz sales:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/hiddenListing', async (req: Request, res: Response) => {
  try {
    const { savedSearchId, listingId } = req.body;

    if (!savedSearchId || !listingId) {
      return res.status(400).json({ error: 'savedSearchId and listingId are required' });
    }

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
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: 'Listing already hidden' });
    }

    console.error('Error hiding listing:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/hiddenListing', async (req: Request, res: Response) => {
  try {
    const { savedSearchId, listingId } = req.body;

    if (!savedSearchId || !listingId) {
      return res.status(400).json({ error: 'savedSearchId and listingId are required' });
    }

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
  } catch (error: any) {
    console.error('Error unhiding listing:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/hiddenListings', async (req: Request, res: Response) => {
  try {
    const savedSearchId = req.query.savedSearchId as string;

    if (!savedSearchId) {
      return res.status(400).json({ error: 'savedSearchId is required' });
    }

    const stmt = db.prepare('SELECT listingId FROM hiddenListings WHERE savedSearchId = ?');
    const hiddenListings = stmt.all(savedSearchId);

    res.json({ hiddenListings: hiddenListings.map((row: any) => row.listingId) });
  } catch (error: any) {
    console.error('Error fetching hidden listings:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
