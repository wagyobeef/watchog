import db from "../db/database.js";

const AUCTION_ENDING_SOON_THRESHOLD_HOURS = 3;

export function sendNewSaleNotification(
  savedSearchId: number,
  latestSale: any,
): Promise<string | null> {
  console.log("[sendNewSaleNotification] Start", { savedSearchId, latestSale });
  const saleDate = latestSale?.saleDate;
  const rawPrice = latestSale?.price;
  const roundedPrice = Math.round(parseFloat(rawPrice));

  if (!saleDate || rawPrice === undefined || Number.isNaN(roundedPrice)) {
    console.log("[sendNewSaleNotification] Skip: missing/invalid sale data");
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
    console.log("[sendNewSaleNotification] Skip: already sent");
    return Promise.resolve(null);
  }

  const savedSearch: any = db
    .prepare("SELECT query, createdAt FROM savedSearches WHERE id = ?")
    .get(savedSearchId);
  const queryName = savedSearch?.query || `Search ${savedSearchId}`;
  const createdAt = savedSearch?.createdAt;

  if (createdAt) {
    const saleMs = new Date(saleDate).getTime();
    const createdAtMs = new Date(createdAt.replace(" ", "T") + "Z").getTime();
    if (
      !Number.isNaN(saleMs) &&
      !Number.isNaN(createdAtMs) &&
      saleMs < createdAtMs
    ) {
      console.log(
        "[sendNewSaleNotification] Skip: sale before search creation",
        {
          saleDate,
          createdAt,
        },
      );
      return Promise.resolve(null);
    }
  }

  const saleLink = latestSale?.itemWebUrl || latestSale?.link || "";
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("[sendNewSaleNotification] Skip: missing DISCORD_WEBHOOK_URL");
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
        console.log("[sendNewSaleNotification] Webhook failed", res.status);
        return null;
      }

      db.prepare(
        `
        INSERT INTO sentNotifications (savedSearchId, notificationType, price, listingId, eventDate)
        VALUES (?, ?, ?, ?, ?)
        `,
      ).run(savedSearchId, "newSale", roundedPrice, saleLink || null, saleDate);

      console.log("[sendNewSaleNotification] Sent + recorded");
      return "newSale";
    })
    .catch((error) => {
      console.error("[sendNewSaleNotification] Error:", error);
      return null;
    });
}

export function sendNewLowestBinNotification(
  savedSearchId: number,
  lowestBin: any,
): Promise<string | null> {
  console.log("[sendNewLowestBinNotification] Start", {
    savedSearchId,
    lowestBin,
  });
  const listingId = lowestBin?.itemId;
  const rawPrice = lowestBin?.price;
  const roundedPrice = Math.round(parseFloat(rawPrice));

  if (!listingId || rawPrice === undefined || Number.isNaN(roundedPrice)) {
    console.log(
      "[sendNewLowestBinNotification] Skip: missing/invalid BIN data",
    );
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
    console.log("[sendNewLowestBinNotification] Skip: already sent");
    return Promise.resolve(null);
  }

  const savedSearch: any = db
    .prepare("SELECT query FROM savedSearches WHERE id = ?")
    .get(savedSearchId);
  const queryName = savedSearch?.query || `Search ${savedSearchId}`;

  const binLink = lowestBin?.itemWebUrl || lowestBin?.link || "";
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log(
      "[sendNewLowestBinNotification] Skip: missing DISCORD_WEBHOOK_URL",
    );
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
        console.log(
          "[sendNewLowestBinNotification] Webhook failed",
          res.status,
        );
        return null;
      }

      db.prepare(
        `
        INSERT INTO sentNotifications (savedSearchId, notificationType, price, listingId, eventDate)
        VALUES (?, ?, ?, ?, ?)
        `,
      ).run(savedSearchId, "newLowestBin", roundedPrice, listingId, null);

      console.log("[sendNewLowestBinNotification] Sent + recorded");
      return "newLowestBin";
    })
    .catch((error) => {
      console.error("[sendNewLowestBinNotification] Error:", error);
      return null;
    });
}

export function sendNewAuctionNotification(
  savedSearchId: number,
  nextAuction: any,
): Promise<string | null> {
  console.log("[sendNewAuctionNotification] Start", {
    savedSearchId,
    nextAuction,
  });
  const listingId = nextAuction?.itemId;
  const rawPrice = nextAuction?.price;
  const roundedPrice = Math.round(parseFloat(rawPrice));
  const endDate = nextAuction?.endDate || null;

  if (!listingId || rawPrice === undefined || Number.isNaN(roundedPrice)) {
    console.log(
      "[sendNewAuctionNotification] Skip: missing/invalid auction data",
    );
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
    console.log("[sendNewAuctionNotification] Skip: already sent");
    return Promise.resolve(null);
  }

  const savedSearch: any = db
    .prepare("SELECT query FROM savedSearches WHERE id = ?")
    .get(savedSearchId);
  const queryName = savedSearch?.query || `Search ${savedSearchId}`;

  const auctionLink = nextAuction?.itemWebUrl || nextAuction?.link || "";
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log(
      "[sendNewAuctionNotification] Skip: missing DISCORD_WEBHOOK_URL",
    );
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
        console.log("[sendNewAuctionNotification] Webhook failed", res.status);
        return null;
      }

      db.prepare(
        `
        INSERT INTO sentNotifications (savedSearchId, notificationType, price, listingId, eventDate)
        VALUES (?, ?, ?, ?, ?)
        `,
      ).run(savedSearchId, "newAuction", roundedPrice, listingId, endDate);

      console.log("[sendNewAuctionNotification] Sent + recorded");
      return "newAuction";
    })
    .catch((error) => {
      console.error("[sendNewAuctionNotification] Error:", error);
      return null;
    });
}

export function sendAuctionEndingTodayNotification(
  savedSearchId: number,
  nextAuction: any,
): Promise<string | null> {
  console.log("[sendAuctionEndingTodayNotification] Start", {
    savedSearchId,
    nextAuction,
  });
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
    console.log(
      "[sendAuctionEndingTodayNotification] Skip: missing/invalid auction data",
    );
    return Promise.resolve(null);
  }

  const nowMs = Date.now();
  const endMs = new Date(endDate).getTime();
  const within24Hours = endMs > nowMs && endMs - nowMs <= 24 * 60 * 60 * 1000;
  if (!within24Hours) {
    console.log(
      "[sendAuctionEndingTodayNotification] Skip: not within 24 hours",
      { endDate },
    );
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
    console.log("[sendAuctionEndingTodayNotification] Skip: already sent");
    return Promise.resolve(null);
  }

  const savedSearch: any = db
    .prepare("SELECT query FROM savedSearches WHERE id = ?")
    .get(savedSearchId);
  const queryName = savedSearch?.query || `Search ${savedSearchId}`;

  const auctionLink = nextAuction?.itemWebUrl || nextAuction?.link || "";
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log(
      "[sendAuctionEndingTodayNotification] Skip: missing DISCORD_WEBHOOK_URL",
    );
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
        console.log(
          "[sendAuctionEndingTodayNotification] Webhook failed",
          res.status,
        );
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

      console.log("[sendAuctionEndingTodayNotification] Sent + recorded");
      return "auctionEndingToday";
    })
    .catch((error) => {
      console.error("[sendAuctionEndingTodayNotification] Error:", error);
      return null;
    });
}

export function sendAuctionEndingSoonNotification(
  savedSearchId: number,
  nextAuction: any,
): Promise<string | null> {
  console.log("[sendAuctionEndingSoonNotification] Start", {
    savedSearchId,
    nextAuction,
  });
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
    console.log(
      "[sendAuctionEndingSoonNotification] Skip: missing/invalid auction data",
    );
    return Promise.resolve(null);
  }

  const nowMs = Date.now();
  const endMs = new Date(endDate).getTime();
  const thresholdMs = AUCTION_ENDING_SOON_THRESHOLD_HOURS * 60 * 60 * 1000;
  const withinThreshold = endMs > nowMs && endMs - nowMs <= thresholdMs;
  if (!withinThreshold) {
    console.log(
      "[sendAuctionEndingSoonNotification] Skip: not within threshold",
      { endDate, thresholdHours: AUCTION_ENDING_SOON_THRESHOLD_HOURS },
    );
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
    console.log("[sendAuctionEndingSoonNotification] Skip: already sent");
    return Promise.resolve(null);
  }

  const savedSearch: any = db
    .prepare("SELECT query FROM savedSearches WHERE id = ?")
    .get(savedSearchId);
  const queryName = savedSearch?.query || `Search ${savedSearchId}`;

  const auctionLink = nextAuction?.itemWebUrl || nextAuction?.link || "";
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log(
      "[sendAuctionEndingSoonNotification] Skip: missing DISCORD_WEBHOOK_URL",
    );
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
        console.log(
          "[sendAuctionEndingSoonNotification] Webhook failed",
          res.status,
        );
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

      console.log("[sendAuctionEndingSoonNotification] Sent + recorded");
      return "auctionEndingSoon";
    })
    .catch((error) => {
      console.error("[sendAuctionEndingSoonNotification] Error:", error);
      return null;
    });
}
