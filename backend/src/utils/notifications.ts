import db from "../db/database.js";

const AUCTION_ENDING_SOON_THRESHOLD_HOURS = 3;

export function sendNewSaleNotification(
  savedSearchId: number,
  latestSale: any,
): Promise<string | null> {
  const saleDate = latestSale?.saleDate;
  const rawPrice = latestSale?.price;
  const roundedPrice = Math.round(parseFloat(rawPrice));

  if (!saleDate || rawPrice === undefined || Number.isNaN(roundedPrice)) {
    return Promise.resolve(null);
  }

  const alreadySent = db
    .prepare(
      `
      SELECT id
      FROM sentNotifications
      WHERE savedSearchId = ?
        AND notificationType = ?
        AND eventDate = ?
        AND price = ?
      LIMIT 1
      `,
    )
    .get(savedSearchId, "newSale", saleDate, roundedPrice);

  if (alreadySent) {
    return Promise.resolve(null);
  }

  const savedSearch: any = db
    .prepare("SELECT query FROM savedSearches WHERE id = ?")
    .get(savedSearchId);
  const queryName = savedSearch?.query || `Search ${savedSearchId}`;

  const saleLink = latestSale?.itemWebUrl || latestSale?.link || "";
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return Promise.resolve(null);
  }

  const messageLines = [
    "New Sale",
    `Search: ${queryName}`,
    `Price: $${roundedPrice}`,
    `Date: ${saleDate}`,
    `Link: ${saleLink || "N/A"}`,
  ];

  return fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: messageLines.join("\n") }),
  })
    .then(async (res) => {
      if (!res.ok) {
        return null;
      }

      db.prepare(
        `
        INSERT INTO sentNotifications (savedSearchId, notificationType, price, listingId, eventDate)
        VALUES (?, ?, ?, ?, ?)
        `,
      ).run(savedSearchId, "newSale", roundedPrice, saleLink || null, saleDate);

      return "newSale";
    })
    .catch(() => null);
}

export function sendNewLowestBinNotification(
  savedSearchId: number,
  lowestBin: any,
): Promise<string | null> {
  const listingId = lowestBin?.itemId;
  const rawPrice = lowestBin?.price;
  const roundedPrice = Math.round(parseFloat(rawPrice));

  if (!listingId || rawPrice === undefined || Number.isNaN(roundedPrice)) {
    return Promise.resolve(null);
  }

  const alreadySent = db
    .prepare(
      `
      SELECT id
      FROM sentNotifications
      WHERE savedSearchId = ?
        AND notificationType = ?
        AND listingId = ?
      LIMIT 1
      `,
    )
    .get(savedSearchId, "newLowestBin", listingId);

  if (alreadySent) {
    return Promise.resolve(null);
  }

  const savedSearch: any = db
    .prepare("SELECT query FROM savedSearches WHERE id = ?")
    .get(savedSearchId);
  const queryName = savedSearch?.query || `Search ${savedSearchId}`;

  const binLink = lowestBin?.itemWebUrl || lowestBin?.link || "";
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return Promise.resolve(null);
  }

  const messageLines = [
    "New Lowest BIN",
    `Search: ${queryName}`,
    `Price: $${roundedPrice}`,
    `Link: ${binLink || "N/A"}`,
  ];

  return fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: messageLines.join("\n") }),
  })
    .then(async (res) => {
      if (!res.ok) {
        return null;
      }

      db.prepare(
        `
        INSERT INTO sentNotifications (savedSearchId, notificationType, price, listingId, eventDate)
        VALUES (?, ?, ?, ?, ?)
        `,
      ).run(savedSearchId, "newLowestBin", roundedPrice, listingId, null);

      return "newLowestBin";
    })
    .catch(() => null);
}

export function sendNewAuctionNotification(
  savedSearchId: number,
  nextAuction: any,
): Promise<string | null> {
  const listingId = nextAuction?.itemId;
  const rawPrice = nextAuction?.price;
  const roundedPrice = Math.round(parseFloat(rawPrice));
  const endDate = nextAuction?.endDate || null;

  if (!listingId || rawPrice === undefined || Number.isNaN(roundedPrice)) {
    return Promise.resolve(null);
  }

  const alreadySent = db
    .prepare(
      `
      SELECT id
      FROM sentNotifications
      WHERE savedSearchId = ?
        AND notificationType = ?
        AND listingId = ?
      LIMIT 1
      `,
    )
    .get(savedSearchId, "newAuction", listingId);

  if (alreadySent) {
    return Promise.resolve(null);
  }

  const savedSearch: any = db
    .prepare("SELECT query FROM savedSearches WHERE id = ?")
    .get(savedSearchId);
  const queryName = savedSearch?.query || `Search ${savedSearchId}`;

  const auctionLink = nextAuction?.itemWebUrl || nextAuction?.link || "";
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return Promise.resolve(null);
  }

  const messageLines = [
    "New Auction",
    `Search: ${queryName}`,
    `Current Price: $${roundedPrice}`,
    `End Date: ${endDate || "N/A"}`,
    `Link: ${auctionLink || "N/A"}`,
  ];

  return fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: messageLines.join("\n") }),
  })
    .then(async (res) => {
      if (!res.ok) {
        return null;
      }

      db.prepare(
        `
        INSERT INTO sentNotifications (savedSearchId, notificationType, price, listingId, eventDate)
        VALUES (?, ?, ?, ?, ?)
        `,
      ).run(savedSearchId, "newAuction", roundedPrice, listingId, endDate);

      return "newAuction";
    })
    .catch(() => null);
}

export function sendAuctionEndingTodayNotification(
  savedSearchId: number,
  nextAuction: any,
): Promise<string | null> {
  const listingId = nextAuction?.itemId;
  const rawPrice = nextAuction?.price;
  const roundedPrice = Math.round(parseFloat(rawPrice));
  const endDate = nextAuction?.endDate;

  if (
    !listingId ||
    !endDate ||
    rawPrice === undefined ||
    Number.isNaN(roundedPrice)
  ) {
    return Promise.resolve(null);
  }

  const nowMs = Date.now();
  const endMs = new Date(endDate).getTime();
  const within24Hours = endMs > nowMs && endMs - nowMs <= 24 * 60 * 60 * 1000;
  if (!within24Hours) {
    return Promise.resolve(null);
  }

  const alreadySent = db
    .prepare(
      `
      SELECT id
      FROM sentNotifications
      WHERE savedSearchId = ?
        AND notificationType = ?
        AND listingId = ?
        AND eventDate = ?
      LIMIT 1
      `,
    )
    .get(savedSearchId, "auctionEndingToday", listingId, endDate);

  if (alreadySent) {
    return Promise.resolve(null);
  }

  const savedSearch: any = db
    .prepare("SELECT query FROM savedSearches WHERE id = ?")
    .get(savedSearchId);
  const queryName = savedSearch?.query || `Search ${savedSearchId}`;

  const auctionLink = nextAuction?.itemWebUrl || nextAuction?.link || "";
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return Promise.resolve(null);
  }

  const messageLines = [
    "Auction Ending Within 24 Hours",
    `Search: ${queryName}`,
    `Current Price: $${roundedPrice}`,
    `End Date: ${endDate}`,
    `Link: ${auctionLink || "N/A"}`,
  ];

  return fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: messageLines.join("\n") }),
  })
    .then(async (res) => {
      if (!res.ok) {
        return null;
      }

      db.prepare(
        `
        INSERT INTO sentNotifications (savedSearchId, notificationType, price, listingId, eventDate)
        VALUES (?, ?, ?, ?, ?)
        `,
      ).run(
        savedSearchId,
        "auctionEndingToday",
        roundedPrice,
        listingId,
        endDate,
      );

      return "auctionEndingToday";
    })
    .catch(() => null);
}

export function sendAuctionEndingSoonNotification(
  savedSearchId: number,
  nextAuction: any,
): Promise<string | null> {
  const listingId = nextAuction?.itemId;
  const rawPrice = nextAuction?.price;
  const roundedPrice = Math.round(parseFloat(rawPrice));
  const endDate = nextAuction?.endDate;

  if (
    !listingId ||
    !endDate ||
    rawPrice === undefined ||
    Number.isNaN(roundedPrice)
  ) {
    return Promise.resolve(null);
  }

  const nowMs = Date.now();
  const endMs = new Date(endDate).getTime();
  const thresholdMs = AUCTION_ENDING_SOON_THRESHOLD_HOURS * 60 * 60 * 1000;
  const withinThreshold = endMs > nowMs && endMs - nowMs <= thresholdMs;
  if (!withinThreshold) {
    return Promise.resolve(null);
  }

  const alreadySent = db
    .prepare(
      `
      SELECT id
      FROM sentNotifications
      WHERE savedSearchId = ?
        AND notificationType = ?
        AND listingId = ?
        AND eventDate = ?
      LIMIT 1
      `,
    )
    .get(savedSearchId, "auctionEndingSoon", listingId, endDate);

  if (alreadySent) {
    return Promise.resolve(null);
  }

  const savedSearch: any = db
    .prepare("SELECT query FROM savedSearches WHERE id = ?")
    .get(savedSearchId);
  const queryName = savedSearch?.query || `Search ${savedSearchId}`;

  const auctionLink = nextAuction?.itemWebUrl || nextAuction?.link || "";
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return Promise.resolve(null);
  }

  const messageLines = [
    `Auction Ending Within ${AUCTION_ENDING_SOON_THRESHOLD_HOURS} Hours`,
    `Search: ${queryName}`,
    `Current Price: $${roundedPrice}`,
    `End Date: ${endDate}`,
    `Link: ${auctionLink || "N/A"}`,
  ];

  return fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: messageLines.join("\n") }),
  })
    .then(async (res) => {
      if (!res.ok) {
        return null;
      }

      db.prepare(
        `
        INSERT INTO sentNotifications (savedSearchId, notificationType, price, listingId, eventDate)
        VALUES (?, ?, ?, ?, ?)
        `,
      ).run(
        savedSearchId,
        "auctionEndingSoon",
        roundedPrice,
        listingId,
        endDate,
      );

      return "auctionEndingSoon";
    })
    .catch(() => null);
}
