import * as React from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

const ListingsInfoItem = ({
  item,
  mode = "bin",
  savedSearchId,
  isHidden,
  onToggleHidden,
}) => {
  // mode can be: 'auction', 'sold', 'bin' (buy it now)

  const handleToggleHidden = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!savedSearchId) {
      alert("Cannot hide listings for unsaved searches");
      return;
    }

    if (onToggleHidden) {
      onToggleHidden(item.itemId, !isHidden);
    }
  };

  return (
    <div
      className={`relative flex gap-3 py-3 px-3 -mx-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-100 transition-colors rounded group ${isHidden ? "opacity-40" : ""}`}
    >
      <a
        href={item.itemWebUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex gap-3 flex-1 min-w-0 no-underline cursor-pointer"
      >
        <div className="shrink-0 w-[60px] h-[100px]">
          <img
            src={
              item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl || ""
            }
            alt={item.title}
            className="w-[60px] h-[100px] object-cover rounded block bg-gray-100 border border-gray-300"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML =
                '<div class="w-[60px] h-[100px] bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400">No Image</div>';
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          {/* Title - common for all modes */}
          <div className="m-0 text-[13px] leading-snug font-medium overflow-hidden text-ellipsis line-clamp-2 text-gray-900">
            {item.title}
          </div>

          {/* Seller info - common for all modes */}
          {item.seller && (
            <div className="text-[11px] text-gray-600">
              <strong>Seller:</strong> {item.seller.username} (
              {item.seller.feedbackScore})
            </div>
          )}

          {/* Mode-specific information */}
          {mode === "auction" && (
            <div className="text-[11px] text-gray-600 mt-auto">
              {item.itemEndDate && (
                <div className="text-red-600 font-medium mb-1">
                  Ends: {new Date(item.itemEndDate).toLocaleDateString()}{" "}
                  {new Date(item.itemEndDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
              {item.currentBidPrice?.value && (
                <div>
                  <strong>Current Bid:</strong>{" "}
                  <span className="text-sm font-bold text-blue-700">
                    ${Math.round(parseFloat(item.currentBidPrice.value))}
                    {item.bidCount !== undefined && (
                      <span className="text-[11px] font-normal text-gray-600 ml-1">
                        ({item.bidCount} bid{item.bidCount !== 1 ? "s" : ""})
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {mode === "sold" && (
            <div className="text-[11px] text-gray-600 mt-auto">
              {item.itemEndDate && (
                <div className="text-gray-600 mb-1">
                  Sold: {new Date(item.itemEndDate).toLocaleDateString()}
                </div>
              )}
              {item.price?.value && (
                <div className="text-sm font-bold text-green-600">
                  ${Math.round(parseFloat(item.price.value))}
                </div>
              )}
            </div>
          )}

          {mode === "bin" && (
            <div className="mt-auto">
              {item.price?.value && (
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="text-base font-bold text-blue-700">
                    ${Math.round(parseFloat(item.price.value))}
                  </div>
                  {item.shippingOptions?.[0]?.shippingCost?.value ===
                    "0.00" && (
                    <span className="text-[11px] text-green-600">
                      Free Shipping
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </a>

      {/* Eye icon toggle - only show for saved searches */}
      {savedSearchId && (
        <button
          onClick={handleToggleHidden}
          className="absolute bottom-2 right-2 p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
          aria-label={isHidden ? "Show listing" : "Hide listing"}
          title={isHidden ? "Show listing" : "Hide listing"}
        >
          {isHidden ? (
            <FiEyeOff className="text-sm text-gray-600" />
          ) : (
            <FiEye className="text-sm text-gray-600" />
          )}
        </button>
      )}
    </div>
  );
};

export default ListingsInfoItem;
