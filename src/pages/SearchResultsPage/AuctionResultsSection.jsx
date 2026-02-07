import * as React from 'react';
import ResultsSection from './ResultsSection.jsx';

const AuctionResultsSection = ({ query }) => {
  const [auctionItems, setAuctionItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!query) return;

    const fetchAuctions = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3001/api/itemAuctionResults?query=${encodeURIComponent(query)}`
        );
        const data = await response.json();

        // Filter for auction items only and sort by ending soonest
        const auctions = (data.results?.itemSummaries || [])

        console.log('Auction items:', auctions);
        console.log('First auction item:', auctions[0]);

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
    <ResultsSection
      title="Upcoming Auctions"
      items={auctionItems}
      loading={loading}
      mode="auction"
    />
  );
};

export default AuctionResultsSection;
