import * as React from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

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

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>eBay Watcher</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for items..."
          style={{
            padding: '10px',
            width: '300px',
            fontSize: '14px',
            marginRight: '10px'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Searching...' : 'Submit'}
        </button>
      </form>

      {results && results.results && results.results.itemSummaries && (
        <div style={{ marginTop: '20px' }}>
          <h3>Results (showing first 3):</h3>
          <pre>{JSON.stringify(results.results.itemSummaries.slice(0, 3), null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

const root = createRoot(document.body);
root.render(<App />);
