import * as React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [query, setQuery] = React.useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Navigate to search results page with query parameter
    navigate(`/search?query=${encodeURIComponent(query)}`);
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
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default HomePage;
