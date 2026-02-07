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
    <div className="p-5">
      <h2 className="text-2xl font-semibold mb-4">eBay Watcher</h2>
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for items..."
          className="px-3 py-2 w-80 text-sm border border-gray-300 rounded mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-5 py-2 text-sm bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 transition-colors"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default HomePage;
