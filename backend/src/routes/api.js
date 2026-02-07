import express from 'express';
import { getEbayAccessToken } from '../utils/ebay.js';

const router = express.Router();

let ebayAccessToken = null;

router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is healthy' });
});

router.get('/ebay/oauth', (req, res) => {
  const token = getEbayAccessToken();
  res.json({ token });
});

export default router;
