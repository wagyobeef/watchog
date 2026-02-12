import * as React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import TopBar from '../../components/TopBar.tsx';
import SummarySection from './SummarySection.tsx';
import NotificationsSection from './NotificationsSection.tsx';
import AuctionsInfoSection from './AuctionsInfoSection.tsx';
import BinsInfoSection from './BinsInfoSection.tsx';
import SalesInfoSection from './SalesInfoSection.tsx';
import SaveSearchButton from './SaveSearchButton.tsx';

const InfoPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('query');
  const savedSearchId = searchParams.get('id');
  const [savedSearch, setSavedSearch] = React.useState(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Live summary data (from current API calls)
  const [summaryData, setSummaryData] = React.useState({
    lastSale: null,
    lastSaleLink: null,
    lastSaleOccurredAt: null,
    lowestBin: null,
    lowestBinLink: null,
    nextAuctionCurrentPrice: null,
    nextAuctionLink: null,
    nextAuctionEndAt: null
  });

  const fetchSavedSearch = React.useCallback(async () => {
    if (!savedSearchId) {
      setSavedSearch(null);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/savedSearches');
      const data = await response.json();
      const search = data.searches?.find(s => s.id === parseInt(savedSearchId));
      setSavedSearch(search || null);

      // Initialize summary data with cached values if available
      if (search) {
        setSummaryData({
          lastSale: search.lastSale,
          lastSaleLink: search.lastSaleLink,
          lastSaleOccurredAt: search.lastSaleOccurredAt,
          lowestBin: search.lowestBin,
          lowestBinLink: search.lowestBinLink,
          nextAuctionCurrentPrice: search.nextAuctionCurrentPrice,
          nextAuctionLink: search.nextAuctionLink,
          nextAuctionEndAt: search.nextAuctionEndAt
        });
      }
    } catch (error) {
      console.error('Error fetching saved search:', error);
    }
  }, [savedSearchId]);

  React.useEffect(() => {
    fetchSavedSearch();
  }, [fetchSavedSearch, refreshKey]);

  const handleDataUpdated = React.useCallback(() => {
    // Trigger a refresh of saved search data
    setRefreshKey(prev => prev + 1);
  }, []);

  const updateSummaryData = React.useCallback((updates) => {
    setSummaryData(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <div>
      <TopBar
        leftComponent={
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm cursor-pointer bg-transparent border-0 flex items-center gap-2 hover:bg-gray-200 rounded transition-colors"
          >
            <IoChevronBack className="text-md" />
            <span>Home</span>
          </button>
        }
        middleComponent={
          <h3 className="m-0 text-base font-semibold">
            {query}
          </h3>
        }
        rightComponent={
          <SaveSearchButton query={query} savedSearchId={savedSearchId} summaryData={summaryData} />
        }
      />

      <div className="p-5">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-5">
          <div className="flex flex-col gap-5">
            <SummarySection
              query={query}
              savedSearchId={savedSearchId}
              savedSearch={savedSearch}
              summaryData={summaryData}
            />
            <NotificationsSection
              savedSearchId={savedSearchId}
              savedSearch={savedSearch}
            />
            <SalesInfoSection
              query={query}
              savedSearchId={savedSearchId}
              onDataUpdated={handleDataUpdated}
              onSummaryUpdate={updateSummaryData}
            />
          </div>

          <div className="flex flex-col gap-5">
            <AuctionsInfoSection
              query={query}
              savedSearchId={savedSearchId}
              onDataUpdated={handleDataUpdated}
              onSummaryUpdate={updateSummaryData}
            />
            <BinsInfoSection
              query={query}
              savedSearchId={savedSearchId}
              onDataUpdated={handleDataUpdated}
              onSummaryUpdate={updateSummaryData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
