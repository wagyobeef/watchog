import * as React from 'react';
import { useNavigate } from 'react-router-dom';

const SavedItemsList = () => {
  const [searches, setSearches] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchSavedSearches = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/savedSearches');
        const data = await response.json();
        setSearches(data.searches || []);
      } catch (error) {
        console.error('Error fetching saved searches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedSearches();
  }, []);

  const handleSearchClick = (query, id) => {
    navigate(`/search?query=${encodeURIComponent(query)}&id=${id}`);
  };

  return (
    <div>
      {loading && <p className="text-gray-600">Loading saved searches...</p>}

      {!loading && (!searches || searches.length === 0) && (
        <p className="text-gray-600">No saved searches yet.</p>
      )}

      {!loading && searches && searches.length > 0 && (
        <div className="flex flex-col gap-3">
          {searches.map((search) => (
            <button
              key={search.id}
              onClick={() => handleSearchClick(search.query, search.id)}
              className="p-4 text-left text-sm bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {search.query}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedItemsList;
