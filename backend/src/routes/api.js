import express from 'express';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is healthy' });
});

// Sample POST route
router.post('/data', (req, res) => {
  const data = req.body;
  res.json({ message: 'Data received', data });
});

export default router;
