import express, { Request, Response } from "express";
import db from "../db/database.js";
import listingsRouter from "./listings.js";
import savedSearchesRouter from "./savedSearches.js";
import notificationsRouter from "./notifications.js";

const router = express.Router();

router.use(listingsRouter);
router.use(savedSearchesRouter);
router.use(notificationsRouter);

router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", message: "Server is healthy" });
});

router.post("/resetDatabase", async (req: Request, res: Response) => {
  try {
    const stmt = db.prepare("DELETE FROM savedSearches");
    stmt.run();

    db.prepare("DELETE FROM sqlite_sequence WHERE name = ?").run(
      "savedSearches",
    );

    res.json({
      success: true,
      message: "Database reset successfully",
    });
  } catch (error: any) {
    console.error("Error resetting database:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
