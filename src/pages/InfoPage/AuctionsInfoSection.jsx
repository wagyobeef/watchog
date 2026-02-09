import * as React from 'react';
import ListingsInfoSection from './ListingsInfoSection.jsx';

const UpcomingAuctionsSection = ({ query }) => {
  const [auctionItems, setAuctionItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!query) return;

    const fetchAuctions = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3001/api/itemAuctionsInfo?query=${encodeURIComponent(query)}`
        );
        const data = await response.json();

        // Filter for auction items only and sort by ending soonest
        const auctions = (data.results?.itemSummaries || [])

        setAuctionItems(auctions);
      } catch (error) {
        console.error('Error fetching auction results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [query]);

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
