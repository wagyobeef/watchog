import * as React from 'react';
import ListingsInfoSection from './ListingsInfoSection.jsx';

const UpcomingAuctionsSection = ({ query, savedSearchId, onDataUpdated, onSummaryUpdate }) => {
  const [auctionItems, setAuctionItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!query) return;

    const fetchAuctions = async () => {
      setLoading(true);
      try {
        const url = new URL('http://localhost:3001/api/itemAuctionsInfo');
        url.searchParams.append('query', query);
        if (savedSearchId) {
          url.searchParams.append('savedSearchId', savedSearchId);
        }
        const response = await fetch(url);
        const data = await response.json();

        // Filter for auction items only and sort by ending soonest
        const auctions = (data.results?.itemSummaries || [])

        setAuctionItems(auctions);

        // Update summary with next auction data
        if (auctions.length > 0 && onSummaryUpdate) {
          const nextAuction = auctions[0];
          const currentPrice = nextAuction.currentBidPrice?.value || nextAuction.price?.value;
          onSummaryUpdate({
            nextAuctionCurrentPrice: currentPrice ? Math.round(parseFloat(currentPrice)) : null,
            nextAuctionLink: nextAuction.itemWebUrl || null,
            nextAuctionEndAt: nextAuction.itemEndDate || null
          });
        }

        // Notify parent that data was updated
        if (savedSearchId && onDataUpdated) {
          onDataUpdated();
        }
      } catch (error) {
        console.error('Error fetching auction results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [query, savedSearchId, onDataUpdated, onSummaryUpdate]);

  return (
    <ListingsInfoSection
      title="Upcoming Auctions"
      items={auctionItems}
      loading={loading}
      mode="auction"
    />
  );
};

export default UpcomingAuctionsSection;
