import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';
const TICK_INTERVAL_MS = 60 * 1000;
const MIN_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

const dbPath = path.join(__dirname, '../backend/watchog.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

function getStalestSearch(): any {
    return db.prepare(`
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
    `).get();
}

async function refreshSearch(search: any) {
    const params = new URLSearchParams({
        query: search.query,
        savedSearchId: search.id.toString()
    });

    const [salesRes, auctionsRes, binsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/itemSalesInfo?${params}`),
        fetch(`${API_BASE_URL}/itemAuctionsInfo?${params}`),
        fetch(`${API_BASE_URL}/itemBinsInfo?${params}`)
    ]);

    return {
        sales: await salesRes.json(),
        auctions: await auctionsRes.json(),
        bins: await binsRes.json()
    };
}

function hasNotificationBeenSent(savedSearchId: number, type: string, listingId?: string, eventDate?: string): boolean {
    const row = db.prepare(`
        SELECT id FROM sentNotifications
        WHERE savedSearchId = ? AND notificationType = ?
        AND (listingId = ? OR (listingId IS NULL AND ? IS NULL))
        AND (eventDate = ? OR (eventDate IS NULL AND ? IS NULL))
    `).get(savedSearchId, type, listingId ?? null, listingId ?? null, eventDate ?? null, eventDate ?? null);
    return !!row;
}

function recordNotification(savedSearchId: number, type: string, price?: number, listingId?: string, eventDate?: string) {
    db.prepare(`
        INSERT INTO sentNotifications (savedSearchId, notificationType, price, listingId, eventDate)
        VALUES (?, ?, ?, ?, ?)
    `).run(savedSearchId, type, price ?? null, listingId ?? null, eventDate ?? null);
}

function sendNotification(search: any, type: string, message: string) {
    // TODO: replace with actual delivery (Electron notification, email, push, etc.)
    console.log(`[NOTIFICATION] "${search.query}" - ${type}: ${message}`);
}

function checkNotifications(search: any, data: any) {
    const { sales, auctions, bins } = data;
    const searchId = search.id;

    // 1. New Sale
    if (search.notifyNewSale && sales.itemSales?.length > 0) {
        const latestSale = sales.itemSales[0];
        if (latestSale.itemId && !hasNotificationBeenSent(searchId, 'notifyNewSale', latestSale.itemId)) {
            const price = Math.round(parseFloat(latestSale.price?.value || 0));
            sendNotification(search, 'New Sale', `$${price} on ${latestSale.saleDate}`);
            recordNotification(searchId, 'notifyNewSale', price, latestSale.itemId);
        }
    }

    // 2. New Lowest BIN
    if (search.notifyNewLowestBin && bins.results?.itemSummaries?.length > 0) {
        const lowestBin = bins.results.itemSummaries[0];
        const price = Math.round(parseFloat(lowestBin.price?.value || 0));
        if (lowestBin.itemId && !hasNotificationBeenSent(searchId, 'notifyNewLowestBin', lowestBin.itemId)) {
            sendNotification(search, 'New Lowest BIN', `$${price}`);
            recordNotification(searchId, 'notifyNewLowestBin', price, lowestBin.itemId);
        }
    }

    // 3. New Auction
    if (search.notifyNewAuction && auctions.results?.itemSummaries?.length > 0) {
        const latestAuction = auctions.results.itemSummaries[0];
        if (latestAuction.itemId && !hasNotificationBeenSent(searchId, 'notifyNewAuction', latestAuction.itemId)) {
            const price = latestAuction.currentBidPrice?.value || latestAuction.price?.value || '0';
            sendNotification(search, 'New Auction', `Current bid: $${Math.round(parseFloat(price))}`);
            recordNotification(searchId, 'notifyNewAuction', Math.round(parseFloat(price)), latestAuction.itemId);
        }
    }

    // 4. Auction Ending Today
    if (search.notifyAuctionEndingToday && auctions.results?.itemSummaries?.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        for (const auction of auctions.results.itemSummaries) {
            if (!auction.itemEndDate) continue;
            const endDate = auction.itemEndDate.split('T')[0];
            if (endDate === today && !hasNotificationBeenSent(searchId, 'notifyAuctionEndingToday', auction.itemId, today)) {
                const price = auction.currentBidPrice?.value || auction.price?.value || '0';
                sendNotification(search, 'Auction Ending Today', `$${Math.round(parseFloat(price))} - ends ${auction.itemEndDate}`);
                recordNotification(searchId, 'notifyAuctionEndingToday', Math.round(parseFloat(price)), auction.itemId, today);
            }
        }
    }

    // 5. Auction Ending Soon (within 2 hours)
    if (search.notifyAuctionEndingSoon && auctions.results?.itemSummaries?.length > 0) {
        const now = Date.now();
        const twoHoursMs = 2 * 60 * 60 * 1000;
        for (const auction of auctions.results.itemSummaries) {
            if (!auction.itemEndDate) continue;
            const endTime = new Date(auction.itemEndDate).getTime();
            const timeLeft = endTime - now;
            if (timeLeft > 0 && timeLeft <= twoHoursMs) {
                const eventKey = auction.itemEndDate.split('T')[0];
                if (!hasNotificationBeenSent(searchId, 'notifyAuctionEndingSoon', auction.itemId, eventKey)) {
                    const price = auction.currentBidPrice?.value || auction.price?.value || '0';
                    const minutesLeft = Math.round(timeLeft / 60000);
                    sendNotification(search, 'Auction Ending Soon', `$${Math.round(parseFloat(price))} - ${minutesLeft} min left`);
                    recordNotification(searchId, 'notifyAuctionEndingSoon', Math.round(parseFloat(price)), auction.itemId, eventKey);
                }
            }
        }
    }
}

function updateLastScheduledAt(searchId: number) {
    db.prepare('UPDATE savedSearches SET lastScheduledAt = CURRENT_TIMESTAMP WHERE id = ?').run(searchId);
}

async function main() {
    try {
        const search = getStalestSearch();
        if (!search) {
            return;
        }

        if (search.lastScheduledAt) {
            const lastRun = new Date(search.lastScheduledAt + 'Z').getTime();
            if (Date.now() - lastRun < MIN_REFRESH_INTERVAL_MS) {
                return;
            }
        }

        console.log(`[${new Date().toISOString()}] Refreshing: "${search.query}"`);

        const data = await refreshSearch(search);
        checkNotifications(search, data);
        updateLastScheduledAt(search.id);

        console.log(`[${new Date().toISOString()}] Done: "${search.query}"`);
    } catch (error) {
        console.error('Scheduler tick error:', error);
    }
}

console.log(`Scheduler started (interval: ${TICK_INTERVAL_MS / 1000}s, min refresh: ${MIN_REFRESH_INTERVAL_MS / 1000}s)`);
console.log(`API: ${API_BASE_URL}`);
console.log(`Database: ${dbPath}`);

main();
setInterval(main, TICK_INTERVAL_MS);
