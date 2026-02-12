import * as React from 'react';
import ListingsInfoSection from './ListingsInfoSection.jsx';

const BinsSection = ({ query, savedSearchId, onDataUpdated, onSummaryUpdate }) => {
  const [binItems, setBinItems] = React.useState([]);
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
        const url = new URL('http://localhost:3001/api/hiddenListings');
        url.searchParams.append('savedSearchId', savedSearchId);
        const response = await fetch(url);
        const data = await response.json();
        setHiddenListingIds(data.hiddenListings || []);
      } catch (error) {
        console.error('Error fetching hidden listings:', error);
      }
    };

    fetchHiddenListings();
  }, [savedSearchId]);

  const fetchBins = React.useCallback(async () => {
    if (!query) return;

    setLoading(true);
    try {
      const url = new URL('http://localhost:3001/api/itemBinsInfo');
      url.searchParams.append('query', query);
      if (savedSearchId) {
        url.searchParams.append('savedSearchId', savedSearchId);
      }
      const response = await fetch(url);
      const data = await response.json();

      // Backend already filtered hidden listings and sorted by price
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
  }, [query, savedSearchId, onDataUpdated, onSummaryUpdate]);

  React.useEffect(() => {
    fetchBins();
  }, [fetchBins]);

  const handleToggleHidden = async (listingId, shouldHide) => {
    try {
      const url = 'http://localhost:3001/api/hiddenListing';
      const method = shouldHide ? 'POST' : 'DELETE';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          savedSearchId: parseInt(savedSearchId),
          listingId
        }),
      });

      if (response.ok) {
        // Update hidden listings state
        setHiddenListingIds(prev =>
          shouldHide
            ? [...prev, listingId]
            : prev.filter(id => id !== listingId)
        );

        // Refetch bins to recalculate summary metrics
        await fetchBins();
      } else {
        const data = await response.json();
        alert('Failed to update listing visibility: ' + data.error);
      }
    } catch (error) {
      console.error('Error toggling listing visibility:', error);
      alert('Failed to update listing visibility.');
    }
  };

  return (
    <ListingsInfoSection
      title="Lowest BINs"
      items={binItems}
      loading={loading}
      mode="bin"
      savedSearchId={savedSearchId}
      hiddenListingIds={hiddenListingIds}
      onToggleHidden={handleToggleHidden}
      displayLimit={5}
    />
  );
};

export default BinsSection;
