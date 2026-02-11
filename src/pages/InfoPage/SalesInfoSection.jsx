import * as React from 'react';
import SalesInfoItem from './SalesInfoItem.jsx';
import LoadingIndicator from '../../components/LoadingIndicator.jsx';

const SalesInfoSection = ({ query }) => {
  const [sales, setSales] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!query) return;

    const fetchSales = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3001/api/itemSalesInfo?query=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setSales(data.itemSales || []);
      } catch (error) {
        console.error('Error fetching sales:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [query]);

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
          {sales.map((sale) => (
            <SalesInfoItem key={sale.itemId} sale={sale} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesInfoSection;
