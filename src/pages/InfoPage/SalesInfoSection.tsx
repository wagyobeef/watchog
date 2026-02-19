import * as React from 'react';
import SalesInfoItem from './SalesInfoItem.tsx';
import LoadingIndicator from '../../components/LoadingIndicator.tsx';
import { API_BASE_URL } from '../../config';

const SalesInfoSection = ({ query, savedSearchId, onDataUpdated, onSummaryUpdate }) => {
  const [sales, setSales] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!query) return;

    const fetchSales = async () => {
      setLoading(true);
      try {
        const url = new URL(`${API_BASE_URL}/itemSalesInfo`);
        url.searchParams.append('query', query);
        if (savedSearchId) {
          url.searchParams.append('savedSearchId', savedSearchId);
        }
        const response = await fetch(url);
        const data = await response.json();
        setSales(data.itemSales || []);

        // Update summary with latest sale data
        if (data.itemSales?.length > 0 && onSummaryUpdate) {
          const mostRecentSale = data.itemSales[0];
          onSummaryUpdate({
            lastSale: mostRecentSale.price?.value ? Math.round(parseFloat(mostRecentSale.price.value)) : null,
            lastSaleLink: mostRecentSale.itemWebUrl || null,
            lastSaleOccurredAt: mostRecentSale.saleDate || null
          });
        }

        // Notify parent that data was updated
        if (savedSearchId && onDataUpdated) {
          onDataUpdated();
        }
      } catch (error) {
        console.error('Error fetching sales:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [query, savedSearchId, onDataUpdated, onSummaryUpdate]);

  return (
    <div className="border border-gray-300 rounded-lg bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold mb-2 mt-0">
        Recent Sales
      </h3>

      {loading && <LoadingIndicator />}

      {!loading && (!sales || sales.length === 0) && (
        <p className="text-gray-600">No sales found.</p>
      )}

      {!loading && sales && sales.length > 0 && (
        <div className="flex flex-col">
          {sales.slice(0, 5).map((sale) => (
            <SalesInfoItem key={sale.itemId} sale={sale} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesInfoSection;
