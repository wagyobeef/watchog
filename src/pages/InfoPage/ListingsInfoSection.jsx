import * as React from 'react';
import ListingsInfoItem from './ListingsInfoItem.jsx';

const ListingsInfoSection = ({ title, items, loading, mode = 'bin' }) => {
  return (
    <div className="border border-gray-300 rounded-lg bg-white p-5 shadow-sm h-full">
      <h3 className="text-lg font-semibold mb-2 mt-0">
        {title}
      </h3>

      {loading && <p className="text-gray-600">Loading...</p>}

      {!loading && (!items || items.length === 0) && (
        <p className="text-gray-600">No results found.</p>
      )}

      {!loading && items && items.length > 0 && (

        <div className="flex flex-col">
          {items.map((item) => (
            <ListingsInfoItem key={item.itemId} item={item} mode={mode} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListingsInfoSection;
