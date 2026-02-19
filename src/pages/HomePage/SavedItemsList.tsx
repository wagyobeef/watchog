import * as React from "react";
import SavedItemsRow from "./SavedItemsRow.tsx";
import { API_BASE_URL } from "../../config";

const SavedItemsList = () => {
  const [searches, setSearches] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchSavedSearches = async () => {
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
    };

    fetchSavedSearches();
  }, []);

  return (
    <div>
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
