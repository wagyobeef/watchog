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
      <div className="font-semibold text-base mb-3">
        {search.query}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <div className="text-[13px] leading-snug font-medium text-gray-900 mb-1">My Cost</div>
          <div className="text-lg font-semibold">
            {search.cost !== null && search.cost !== undefined ? `$${search.cost}` : '--'}
          </div>
        </div>

        <div>
          <div className="text-[13px] leading-snug font-medium text-gray-900 mb-1">Last Sale</div>
          <div className="text-lg font-semibold">--</div>
        </div>

        <div>
          <div className="text-[13px] leading-snug font-medium text-gray-900 mb-1">Lowest BIN</div>
          <div className="text-lg font-semibold">--</div>
        </div>

        <div>
          <div className="text-[13px] leading-snug font-medium text-gray-900 mb-1">Next Auction</div>
          <div className="text-lg font-semibold">--</div>
        </div>
      </div>
    </button>
  );
};

export default SavedItemsRow;
