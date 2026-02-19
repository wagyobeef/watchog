import express, { Request, Response } from "express";
import db from "../db/database.js";

const router = express.Router();

router.get("/savedSearches", async (req: Request, res: Response) => {
  try {
    const stmt = db.prepare(`
      SELECT
        s.*,
        n.notifyNewLowestBin,
        n.notifyNewSale,
        n.notifyNewAuction,
        n.notifyAuctionEndingToday,
        n.notifyAuctionEndingSoon
      FROM savedSearches s
      LEFT JOIN notificationSettings n ON s.id = n.savedSearchId
      ORDER BY s.createdAt DESC
    `);
    const searches = stmt.all();

    res.json({ searches });
  } catch (error: any) {
    console.error("Error fetching saved searches:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/savedSearch", async (req: Request, res: Response) => {
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
      nextAuctionEndAt,
    } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: "Query is required" });
    }

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
      nextAuctionEndAt || null,
    );

    res.json({
      success: true,
      id: result.lastInsertRowid,
      query: query.trim(),
    });
  } catch (error: any) {
    if (error.code === "SQLITE_CONSTRAINT") {
      return res.status(409).json({ error: "Search query already saved" });
    }

    console.error("Error saving search:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/savedSearch", async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    const stmt = db.prepare("DELETE FROM savedSearches WHERE id = ?");
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Search not found" });
    }

    res.json({
      success: true,
      id: id,
      deleted: true,
    });
  } catch (error: any) {
    console.error("Error deleting search:", error);
    res.status(500).json({ error: error.message });
  }
});

router.patch("/itemCost", async (req: Request, res: Response) => {
  try {
    const { id, cost } = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    if (cost === undefined || cost === null) {
      return res.status(400).json({ error: "Cost is required" });
    }

    const stmt = db.prepare("UPDATE savedSearches SET cost = ? WHERE id = ?");
    const result = stmt.run(cost, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Search not found" });
    }

    res.json({
      success: true,
      id: id,
      cost: cost,
    });
  } catch (error: any) {
    console.error("Error updating cost:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/oldestScheduledSearch", async (req: Request, res: Response) => {
  try {
    const search = db
      .prepare(
        `
      SELECT
        s.*,
        n.notifyNewLowestBin,
        n.notifyNewSale,
        n.notifyNewAuction,
        n.notifyAuctionEndingToday,
        n.notifyAuctionEndingSoon
      FROM savedSearches s
      LEFT JOIN notificationSettings n ON s.id = n.savedSearchId
      ORDER BY s.lastScheduledAt ASC NULLS FIRST
      LIMIT 1
    `,
      )
      .get();

    res.json({ search: search || null });
  } catch (error: any) {
    console.error("Error fetching oldest scheduled search:", error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/savedSearchLastScheduledAt', async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    const stmt = db.prepare('UPDATE savedSearches SET lastScheduledAt = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Search not found' });
    }

    res.json({
      success: true,
      id: id
    });
  } catch (error: any) {
    console.error('Error updating lastScheduledAt:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
