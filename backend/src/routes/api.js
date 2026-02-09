import express from 'express';
import { getEbayItemResults } from '../utils/ebay.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is healthy' });
});

router.get('/itemResults', async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    const results = await getEbayItemResults(query);
    res.json({ results });
  } catch (error) {
    console.error('Error fetching eBay results:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/auctionsInfo', async (req, res) => {
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

    const results = await getEbayItemResults(query, options);
    res.json({ results });
  } catch (error) {
    console.error('Error fetching eBay auction results:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/binInfo', async (req, res) => {
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

    const results = await getEbayItemResults(query, options);
    console.log(results)
    res.json({ results });
  } catch (error) {
    console.error('Error fetching eBay buy it now results:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
