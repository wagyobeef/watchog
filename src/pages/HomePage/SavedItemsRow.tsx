import * as React from "react";
import { useNavigate } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";

const SavedItemsRow = ({ search }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(
      `/search?query=${encodeURIComponent(search.query)}&id=${search.id}`,
    );
  };

  return (
    <button
      onClick={handleClick}
      className="p-4 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-base">{search.query}</div>
        {search.lastScheduledAt && (
          <div className="text-[11px] text-gray-500">
            Last updated{" "}
            {new Date(search.lastScheduledAt + "Z").toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <div className="text-[13px] leading-snug font-medium text-gray-900 mb-1">
            My Cost
          </div>
          <div className="text-lg font-semibold">
            {search.cost !== null && search.cost !== undefined
              ? `$${search.cost}`
              : "--"}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 mb-1">
            <div className="text-[13px] leading-snug font-medium text-gray-900">
              Last Sale
            </div>
            {search.lastSaleLink && (
              <a
                href={search.lastSaleLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <FiExternalLink className="text-[11px] text-gray-600" />
              </a>
            )}
          </div>
          <div className="text-lg font-semibold">
            {search.lastSale !== null && search.lastSale !== undefined
              ? `$${search.lastSale}`
              : "--"}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 mb-1">
            <div className="text-[13px] leading-snug font-medium text-gray-900">
              Lowest BIN
            </div>
            {search.lowestBinLink && (
              <a
                href={search.lowestBinLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <FiExternalLink className="text-[11px] text-gray-600" />
              </a>
            )}
          </div>
          <div className="text-lg font-semibold">
            {search.lowestBin !== null && search.lowestBin !== undefined
              ? `$${search.lowestBin}`
              : "--"}
          </div>
        </div>

        <div>
          <div className="text-[13px] leading-snug font-medium text-gray-900 mb-1">
            Next Auction
          </div>
          <div className="text-lg font-semibold">
            {search.nextAuctionCurrentPrice !== null &&
            search.nextAuctionCurrentPrice !== undefined
              ? `$${search.nextAuctionCurrentPrice}`
              : "--"}
          </div>
        </div>
      </div>
    </button>
  );
};

export default SavedItemsRow;
