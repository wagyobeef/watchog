import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

const SaveSearchButton = ({ query, savedSearchId, summaryData }) => {
  const navigate = useNavigate();
  const isSaved = !!savedSearchId;

  const handleSaveSearch = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/savedSearch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          lastSale: summaryData?.lastSale,
          lastSaleLink: summaryData?.lastSaleLink,
          lastSaleOccurredAt: summaryData?.lastSaleOccurredAt,
          lowestBin: summaryData?.lowestBin,
          lowestBinLink: summaryData?.lowestBinLink,
          nextAuctionCurrentPrice: summaryData?.nextAuctionCurrentPrice,
          nextAuctionLink: summaryData?.nextAuctionLink,
          nextAuctionEndAt: summaryData?.nextAuctionEndAt
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Search saved successfully!');
        // Update URL without reloading the page
        navigate(`/search?query=${encodeURIComponent(query)}&id=${data.id}`, { replace: true });
      } else if (response.status === 409) {
        alert('This search is already saved.');
      } else {
        alert('Failed to save search: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving search:', error);
      alert('Failed to save search.');
    }
  };

  const handleUnsaveSearch = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/savedSearch`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: savedSearchId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Search unsaved successfully!');
        // Update URL without reloading the page
        navigate(`/search?query=${encodeURIComponent(query)}`, { replace: true });
      } else {
        alert('Failed to unsave search: ' + data.error);
      }
    } catch (error) {
      console.error('Error unsaving search:', error);
      alert('Failed to unsave search.');
    }
  };

  return (
    <button
      onClick={isSaved ? handleUnsaveSearch : handleSaveSearch}
      className={
        isSaved
          ? 'px-4 py-2 text-sm cursor-pointer text-white border-0 rounded bg-[#9B1D20] hover:bg-[#7A1719] transition-colors'
          : 'px-4 py-2 text-sm cursor-pointer text-white border-0 rounded bg-[#094074] hover:bg-[#073059] transition-colors'
      }
    >
      {isSaved ? 'Unsave' : 'Save'}
    </button>
  );
};

export default SaveSearchButton;
