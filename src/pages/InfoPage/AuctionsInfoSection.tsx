import * as React from "react";
import ListingsInfoSection from "./ListingsInfoSection.tsx";
import { API_BASE_URL } from "../../config";

const UpcomingAuctionsSection = ({
  query,
  savedSearchId,
  onDataUpdated,
  onSummaryUpdate,
}) => {
  const [auctionItems, setAuctionItems] = React.useState([]);
  const [hiddenListingIds, setHiddenListingIds] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  // Fetch hidden listings
  React.useEffect(() => {
    if (!savedSearchId) {
      setHiddenListingIds([]);
      return;
    }

    const fetchHiddenListings = async () => {
      try {
        const url = new URL(`${API_BASE_URL}/hiddenListings`);
        url.searchParams.append("savedSearchId", savedSearchId);
        const response = await fetch(url);
        const data = await response.json();
        setHiddenListingIds(data.hiddenListings || []);
      } catch (error) {
        console.error("Error fetching hidden listings:", error);
      }
    };

    fetchHiddenListings();
  }, [savedSearchId]);

  const fetchAuctions = React.useCallback(async () => {
    if (!query) return;

    setLoading(true);
    try {
      const url = new URL(`${API_BASE_URL}/itemAuctionsInfo`);
      url.searchParams.append("query", query);
      if (savedSearchId) {
        url.searchParams.append("savedSearchId", savedSearchId);
      }
      const response = await fetch(url);
      const data = await response.json();

      // Backend already filtered hidden listings
      const auctions = data.results?.itemSummaries || [];

      setAuctionItems(auctions);

      // Update summary with next auction data
      if (auctions.length > 0 && onSummaryUpdate) {
        const nextAuction = auctions[0];
        const currentPrice =
          nextAuction.currentBidPrice?.value || nextAuction.price?.value;
        onSummaryUpdate({
          nextAuctionCurrentPrice: currentPrice
            ? Math.round(parseFloat(currentPrice))
            : null,
          nextAuctionLink: nextAuction.itemWebUrl || null,
          nextAuctionEndAt: nextAuction.itemEndDate || null,
        });
      }

      // Notify parent that data was updated
      if (savedSearchId && onDataUpdated) {
        onDataUpdated();
      }
    } catch (error) {
      console.error("Error fetching auction results:", error);
    } finally {
      setLoading(false);
    }
  }, [query, savedSearchId, onDataUpdated, onSummaryUpdate]);

  React.useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const handleToggleHidden = async (listingId, shouldHide) => {
    try {
      const url = `${API_BASE_URL}/hiddenListing`;
      const method = shouldHide ? "POST" : "DELETE";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          savedSearchId: parseInt(savedSearchId),
          listingId,
        }),
      });

      if (response.ok) {
        // Update hidden listings state
        setHiddenListingIds((prev) =>
          shouldHide
            ? [...prev, listingId]
            : prev.filter((id) => id !== listingId),
        );

        // Refetch auctions to recalculate summary metrics
        await fetchAuctions();
      } else {
        const data = await response.json();
        alert("Failed to update listing visibility: " + data.error);
      }
    } catch (error) {
      console.error("Error toggling listing visibility:", error);
      alert("Failed to update listing visibility.");
    }
  };

  return (
    <ListingsInfoSection
      title="Upcoming Auctions"
      items={auctionItems}
      loading={loading}
      mode="auction"
      savedSearchId={savedSearchId}
      hiddenListingIds={hiddenListingIds}
      onToggleHidden={handleToggleHidden}
      displayLimit={3}
    />
  );
};

export default UpcomingAuctionsSection;
