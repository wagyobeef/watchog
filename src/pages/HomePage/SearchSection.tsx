import * as React from "react";
import { useNavigate } from "react-router-dom";

const SearchSection = () => {
  const [query, setQuery] = React.useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Navigate to search results page with query parameter
    navigate(`/search?query=${encodeURIComponent(query)}`);
  };

  return (
    <div className="py-10 mb-5 border-b border-gray-300 flex flex-col items-center">
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for items..."
          className="px-3 py-2 w-80 text-sm border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-[#094074]"
        />
        <button
          type="submit"
          className="px-5 py-2 text-sm bg-[#094074] text-white rounded-r cursor-pointer hover:bg-[#073059] transition-colors border border-[#094074]"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchSection;
