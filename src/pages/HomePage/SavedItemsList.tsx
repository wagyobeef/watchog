import * as React from "react";
import { IoRefresh } from "react-icons/io5";
import SavedItemsRow from "./SavedItemsRow.tsx";
import { API_BASE_URL } from "../../config";

const SavedItemsList = () => {
  const [searches, setSearches] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const fetchSavedSearches = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/savedSearches`);
      const data = await response.json();
      setSearches(data.searches || []);
    } catch (error) {
      console.error("Error fetching saved searches:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSavedSearches();
  }, [fetchSavedSearches]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold m-0">Saved Searches</h3>
        <button
          onClick={fetchSavedSearches}
          className="p-1.5 bg-transparent border-0 cursor-pointer hover:bg-gray-200 rounded transition-colors"
          aria-label="Refresh"
        >
          <IoRefresh className="text-lg text-gray-600" />
        </button>
      </div>

      {loading && (
        <p className="text-gray-600 text-center py-8">
          Loading saved searches...
        </p>
      )}

      {!loading && (!searches || searches.length === 0) && (
        <p className="text-gray-500 text-center py-8">No saved searches yet.</p>
      )}

      {!loading && searches && searches.length > 0 && (
        <div className="flex flex-col gap-3">
          {searches.map((search) => (
            <SavedItemsRow key={search.id} search={search} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedItemsList;
