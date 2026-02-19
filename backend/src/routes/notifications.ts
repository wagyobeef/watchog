import express, { Request, Response } from 'express';
import db from '../db/database.js';

const router = express.Router();

router.patch('/notificationSettings', async (req: Request, res: Response) => {
  try {
    const { id, notificationType, enabled } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    if (!notificationType) {
      return res.status(400).json({ error: 'notificationType is required' });
    }

    if (enabled === undefined || enabled === null) {
      return res.status(400).json({ error: 'enabled is required' });
    }

    const validTypes = [
      'notifyNewLowestBin',
      'notifyNewSale',
      'notifyNewAuction',
      'notifyAuctionEndingToday',
      'notifyAuctionEndingSoon'
    ];

    if (!validTypes.includes(notificationType)) {
      return res.status(400).json({ error: 'Invalid notification type' });
    }

    const searchExists = db.prepare('SELECT id FROM savedSearches WHERE id = ?').get(id);
    if (!searchExists) {
      return res.status(404).json({ error: 'Search not found' });
    }

    const upsertStmt = db.prepare(`
      INSERT INTO notificationSettings (savedSearchId, ${notificationType})
      VALUES (?, ?)
      ON CONFLICT(savedSearchId) DO UPDATE SET
        ${notificationType} = excluded.${notificationType},
        updatedAt = CURRENT_TIMESTAMP
    `);
    upsertStmt.run(id, enabled ? 1 : 0);

    res.json({
      success: true,
      id: id,
      notificationType,
      enabled
    });
  } catch (error: any) {
    console.error('Error updating notification preference:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
