import * as React from 'react';
import ListingsInfoSection from './ListingsInfoSection.jsx';

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
        setSales(data.results?.itemSummaries || []);
      } catch (error) {
        console.error('Error fetching sales:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [query]);

  console.log("sales");
  console.log(sales)

  return (
    <ListingsInfoSection
      title="Recent Sales"
      items={sales}
      loading={loading}
      mode="sold"
    />
  );
};

export default SalesInfoSection;
