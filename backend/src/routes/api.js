import express from 'express';
import { getEbayItemListings } from '../utils/ebay.js';
import { getItemSales } from '../utils/sales.js';

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

export default router;
