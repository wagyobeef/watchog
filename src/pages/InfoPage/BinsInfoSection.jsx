import * as React from 'react';
import ListingsInfoSection from './ListingsInfoSection.jsx';

const BinsSection = ({ query }) => {
  const [binItems, setBinItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!query) return;

    const fetchBins = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3001/api/itemBinsInfo?query=${encodeURIComponent(query)}`
        );
        const data = await response.json();

        // Sort by price (lowest first)
        const bins = (data.results?.itemSummaries || [])
          .sort((a, b) => {
            const priceA = parseFloat(a.price?.value || 0);
            const priceB = parseFloat(b.price?.value || 0);
            return priceA - priceB;
          });

        setBinItems(bins);
      } catch (error) {
        console.error('Error fetching buy it now results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBins();
  }, [query]);

  return (
    <ListingsInfoSection
      title="Lowest BINs"
      items={binItems}
      loading={loading}
      mode="bin"
    />
  );
};

export default BinsSection;
