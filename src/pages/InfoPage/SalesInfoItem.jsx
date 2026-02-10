import * as React from 'react';

const SalesInfoItem = ({ sale }) => {
  return (
    <div className="flex gap-3 py-3 border-b border-gray-200 last:border-b-0">
      {/* Sale Info */}
      <div className="flex-1">
        <div className="text-sm">
          <strong>Sale Type:</strong> {sale.saleType}
        </div>
        <div className="text-sm">
          <strong>Date:</strong> {sale.saleDate}
        </div>
        <div className="text-sm">
          <strong>Price:</strong>{' '}
          <span className="font-bold text-green-700">
            ${parseFloat(sale.price.value).toFixed(2)}
          </span>
        </div>
      </div>

      {/* eBay Link */}
      <div className="flex items-center">
        <a
          href={sale.itemWebUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          View on eBay
        </a>
      </div>
    </div>
  );
};

export default SalesInfoItem;
