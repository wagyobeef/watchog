import * as React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar.jsx';
import ResultsSection from './ResultsSection.jsx';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('query');
  const [results, setResults] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/itemResults?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        console.log(data);
        setResults(data);
      } catch (error) {
        console.error('Error fetching item results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  // Get all items from results
  const allItems = results?.results?.itemSummaries || [];

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <TopBar
        leftComponent={
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '20px', lineHeight: '1', display: 'flex', alignItems: 'center' }}>‹</span>
            <span>Home</span>
          </button>
        }
        middleComponent={
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
            {query}
          </h3>
        }
      />

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px'
        }}>
          {/* Column 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ResultsSection
              title="Upcoming Auctions"
              items={allItems.slice(0, 5)}
              loading={loading}
            />
            <ResultsSection
              title="Lowest Buy It Now"
              items={allItems.slice(5, 10)}
              loading={loading}
            />
          </div>

          {/* Column 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ResultsSection
              title="Recent Sales"
              items={allItems.slice(10, 15)}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
