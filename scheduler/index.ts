import dotenv from "dotenv";

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001/api";
const TICK_INTERVAL_MS = 60 * 1000;
const MIN_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

async function updateSearch(search: any) {
  const params = new URLSearchParams({
    query: search.query,
    savedSearchId: search.id.toString(),
  });

  const [salesRes, auctionsRes, binsRes] = await Promise.all([
    fetch(`${API_BASE_URL}/itemSalesInfo?${params}`),
    fetch(`${API_BASE_URL}/itemAuctionsInfo?${params}`),
    fetch(`${API_BASE_URL}/itemBinsInfo?${params}`),
  ]);

  return {
    sales: await salesRes.json(),
    auctions: await auctionsRes.json(),
    bins: await binsRes.json(),
  };
}

async function main() {
  try {
    const searchRes = await fetch(`${API_BASE_URL}/oldestScheduledSearch`);
    const searchData = await searchRes.json();
    const search = searchData.search;

    if (!search) {
      return;
    }

    if (search.lastScheduledAt) {
      const lastRun = new Date(search.lastScheduledAt + "Z").getTime();
      if (Date.now() - lastRun < MIN_REFRESH_INTERVAL_MS) {
        return;
      }
    }

    console.log(`[${new Date().toISOString()}] Refreshing: "${search.query}"`);

    const refreshData = await updateSearch(search);

    const latestSale = refreshData.sales.itemSales?.[0] || null;
    const lowestBin = refreshData.bins.results?.itemSummaries?.[0] || null;
    const nextAuction =
      refreshData.auctions.results?.itemSummaries?.[0] || null;

    await fetch(`${API_BASE_URL}/checkNotifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        savedSearchId: search.id,
        latestSale: latestSale
          ? {
              itemId: latestSale.itemId,
              price: latestSale.price?.value,
              saleDate: latestSale.saleDate,
            }
          : null,
        lowestBin: lowestBin
          ? {
              itemId: lowestBin.itemId,
              price: lowestBin.price?.value,
            }
          : null,
        nextAuction: nextAuction
          ? {
              itemId: nextAuction.itemId,
              price:
                nextAuction.currentBidPrice?.value || nextAuction.price?.value,
              endDate: nextAuction.itemEndDate,
            }
          : null,
      }),
    });

    await fetch(`${API_BASE_URL}/savedSearchLastScheduledAt`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: search.id }),
    });

    console.log(`[${new Date().toISOString()}] Done: "${search.query}"`);
  } catch (error) {
    console.error("Scheduler error:", error);
  }
}

console.log(
  `Scheduler started (interval: ${TICK_INTERVAL_MS / 1000}s, min refresh: ${MIN_REFRESH_INTERVAL_MS / 1000}s)`,
);
console.log(`API: ${API_BASE_URL}`);

main();
setInterval(main, TICK_INTERVAL_MS);
