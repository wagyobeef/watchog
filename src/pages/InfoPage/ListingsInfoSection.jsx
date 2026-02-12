import * as React from 'react';
import ListingsInfoItem from './ListingsInfoItem.jsx';
import LoadingIndicator from '../../components/LoadingIndicator.jsx';

const ListingsInfoSection = ({
  title,
  items,
  loading,
  mode = 'bin',
  savedSearchId,
  hiddenListingIds = [],
  onToggleHidden,
  displayLimit
}) => {
  const [showHidden, setShowHidden] = React.useState(false);

  // Filter items based on showHidden toggle
  const visibleItems = React.useMemo(() => {
    if (!items) return [];

    let filtered = items;
    if (!showHidden) {
      filtered = items.filter(item => !hiddenListingIds.includes(item.itemId));
    }

    // Apply display limit if specified
    if (displayLimit) {
      filtered = filtered.slice(0, displayLimit);
    }

    return filtered;
  }, [items, hiddenListingIds, showHidden, displayLimit]);

  return (
    <div className="border border-gray-300 rounded-lg bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold mt-0 mb-0">
          {title}
        </h3>

        {/* Show/Hide toggle - only for saved searches with hidden listings */}
        {savedSearchId && mode !== 'sold' && hiddenListingIds.length > 0 && (
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showHidden}
              onChange={(e) => setShowHidden(e.target.checked)}
              className="cursor-pointer"
            />
            Show hidden
          </label>
        )}
      </div>

      {loading && <LoadingIndicator />}

      {!loading && (!visibleItems || visibleItems.length === 0) && (
        <p className="text-gray-600">No results found.</p>
      )}

      {!loading && visibleItems && visibleItems.length > 0 && (
        <div className="flex flex-col">
          {visibleItems.map((item) => (
            <ListingsInfoItem
              key={item.itemId}
              item={item}
              mode={mode}
              savedSearchId={savedSearchId}
              isHidden={hiddenListingIds.includes(item.itemId)}
              onToggleHidden={onToggleHidden}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListingsInfoSection;
