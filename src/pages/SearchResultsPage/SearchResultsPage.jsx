import * as React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar.jsx';

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
      />

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <h2>"{query}"</h2>

      {loading && <p>Loading...</p>}

      {results && results.results && results.results.itemSummaries && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
            {results.results.itemSummaries.slice(0, 3).map((item) => (
              <div
                key={item.itemId}
                style={{
                  display: 'flex',
                  gap: '20px',
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {/* Image */}
                <div style={{ flexShrink: 0, width: '80px', height: '80px' }}>
                  <img
                    src={item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl || ''}
                    alt={item.title}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      display: 'block',
                      backgroundColor: '#f0f0f0',
                      border: '1px solid #ddd'
                    }}
                    onError={(e) => {
                      console.log('Image failed to load:', item.image);
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div style="width: 80px; height: 80px; background-color: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999;">No Image</div>';
                    }}
                  />
                </div>

                {/* Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', lineHeight: '1.4' }}>
                    {item.title}
                  </h3>

                  <div style={{ fontSize: '12px', color: '#999', fontFamily: 'monospace' }}>
                    Image URL: {item.image?.imageUrl || 'NONE'}
                  </div>

                  <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#666' }}>
                    <span><strong>Condition:</strong> {item.condition}</span>
                    {item.seller && (
                      <span><strong>Seller:</strong> {item.seller.username} ({item.seller.feedbackScore})</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: 'auto' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2a6496' }}>
                      ${parseFloat(item.price.value).toFixed(2)}
                    </div>
                    {item.shippingOptions?.[0]?.shippingCost?.value === "0.00" && (
                      <span style={{ fontSize: '14px', color: '#28a745' }}>Free Shipping</span>
                    )}
                  </div>

                  <a
                    href={item.itemWebUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#007bff',
                      color: '#fff',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: '500',
                      alignSelf: 'flex-start'
                    }}
                  >
                    View on eBay
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && results && (!results.results || !results.results.itemSummaries) && (
        <p>No results found.</p>
      )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
