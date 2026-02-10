import * as React from 'react';

const SalesInfoItem = ({ sale }) => {
  return (
    <a
      href={sale.itemWebUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 py-3 px-3 -mx-3 border-b border-gray-200 last:border-b-0 no-underline hover:bg-gray-100 transition-colors cursor-pointer rounded"
    >
      {/* Sale Info */}
      <div className="flex-1">
        <div className="text-[11px] text-gray-600">
          <strong>Sale Type:</strong> {sale.saleType}
        </div>
        <div className="text-[11px] text-gray-600">
          <strong>Date:</strong> {sale.saleDate}
        </div>
        <div className="text-[11px] text-gray-600">
          <span className="text-sm font-bold text-green-700">
            ${parseFloat(sale.price.value).toFixed(2)}
          </span>
        </div>
      </div>
    </a>
  );
};

export default SalesInfoItem;
