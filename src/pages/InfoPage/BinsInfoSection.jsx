import * as React from 'react';
import ListingsInfoSection from './ListingsInfoSection.jsx';

const BinsSection = ({ query, savedSearchId, onDataUpdated, onSummaryUpdate }) => {
  const [binItems, setBinItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!query) return;

    const fetchBins = async () => {
      setLoading(true);
      try {
        const url = new URL('http://localhost:3001/api/itemBinsInfo');
        url.searchParams.append('query', query);
        if (savedSearchId) {
          url.searchParams.append('savedSearchId', savedSearchId);
        }
        const response = await fetch(url);
        const data = await response.json();

        // Sort by price (lowest first)
        const bins = (data.results?.itemSummaries || [])
          .sort((a, b) => {
            const priceA = parseFloat(a.price?.value || 0);
            const priceB = parseFloat(b.price?.value || 0);
            return priceA - priceB;
          });

        setBinItems(bins);

        // Update summary with lowest BIN data
        if (bins.length > 0 && onSummaryUpdate) {
          const lowestBinItem = bins[0];
          onSummaryUpdate({
            lowestBin: lowestBinItem.price?.value ? Math.round(parseFloat(lowestBinItem.price.value)) : null,
            lowestBinLink: lowestBinItem.itemWebUrl || null
          });
        }

        // Notify parent that data was updated
        if (savedSearchId && onDataUpdated) {
          onDataUpdated();
        }
      } catch (error) {
        console.error('Error fetching buy it now results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBins();
  }, [query, savedSearchId, onDataUpdated, onSummaryUpdate]);

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
