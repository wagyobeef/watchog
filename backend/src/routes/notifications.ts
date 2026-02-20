import express, { Request, Response } from "express";
import db from "../db/database.js";
import {
  sendNewSaleNotification,
  sendNewLowestBinNotification,
  sendNewAuctionNotification,
  sendAuctionEndingTodayNotification,
  sendAuctionEndingSoonNotification,
} from "../utils/notifications.js";

const router = express.Router();

router.patch("/notificationSettings", async (req: Request, res: Response) => {
  try {
    const { id, notificationType, enabled } = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    if (!notificationType) {
      return res.status(400).json({ error: "notificationType is required" });
    }

    if (enabled === undefined || enabled === null) {
      return res.status(400).json({ error: "enabled is required" });
    }

    const validTypes = [
      "notifyNewLowestBin",
      "notifyNewSale",
      "notifyNewAuction",
      "notifyAuctionEndingToday",
      "notifyAuctionEndingSoon",
    ];

    if (!validTypes.includes(notificationType)) {
      return res.status(400).json({ error: "Invalid notification type" });
    }

    const searchExists = db
      .prepare("SELECT id FROM savedSearches WHERE id = ?")
      .get(id);
    if (!searchExists) {
      return res.status(404).json({ error: "Search not found" });
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
      enabled,
    });
  } catch (error: any) {
    console.error("Error updating notification preference:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/checkNotifications", async (req: Request, res: Response) => {
  try {
    const { savedSearchId, latestSale, lowestBin, nextAuction } = req.body;

    if (!savedSearchId) {
      return res.status(400).json({ error: "savedSearchId is required" });
    }

    const settings: any = db
      .prepare("SELECT * FROM notificationSettings WHERE savedSearchId = ?")
      .get(savedSearchId);

    if (!settings) {
      return res.json({ success: true, notifications: [] });
    }

    const sent: string[] = [];

    if (settings.notifyNewSale && latestSale) {
      const result = sendNewSaleNotification(
        savedSearchId,
        settings,
        latestSale,
      );
      if (result) sent.push(result);
    }

    if (settings.notifyNewLowestBin && lowestBin) {
      const result = sendNewLowestBinNotification(
        savedSearchId,
        settings,
        lowestBin,
      );
      if (result) sent.push(result);
    }

    if (settings.notifyNewAuction && nextAuction) {
      const result = sendNewAuctionNotification(
        savedSearchId,
        settings,
        nextAuction,
      );
      if (result) sent.push(result);
    }

    if (settings.notifyAuctionEndingToday && nextAuction) {
      const result = sendAuctionEndingTodayNotification(
        savedSearchId,
        settings,
        nextAuction,
      );
      if (result) sent.push(result);
    }

    if (settings.notifyAuctionEndingSoon && nextAuction) {
      const result = sendAuctionEndingSoonNotification(
        savedSearchId,
        settings,
        nextAuction,
      );
      if (result) sent.push(result);
    }

    res.json({ success: true, notifications: sent });
  } catch (error: any) {
    console.error("Error checking notifications:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
