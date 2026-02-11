import * as React from 'react';
import { useNavigate } from 'react-router-dom';

const SavedItemsRow = ({ search }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/search?query=${encodeURIComponent(search.query)}&id=${search.id}`);
  };

  return (
    <button
      onClick={handleClick}
      className="p-4 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-colors cursor-pointer"
    >
      <div className="font-semibold text-base">
        {search.query}
      </div>
    </button>
  );
};

export default SavedItemsRow;
