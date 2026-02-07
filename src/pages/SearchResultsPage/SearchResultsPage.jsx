import * as React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar.jsx';
import AuctionResultsSection from './AuctionResultsSection.jsx';
import ResultsSection from './ResultsSection.jsx';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('query');
  const [results, setResults] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/itemResults?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        console.log(data);
        setResults(data);
      } catch (error) {
        console.error('Error fetching item results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  // Get all items from results
  const allItems = results?.results?.itemSummaries || [];

  return (
    <div>
      <TopBar
        leftComponent={
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm cursor-pointer bg-transparent border-0 flex items-center gap-2 hover:bg-gray-200 rounded transition-colors"
          >
            <span className="text-xl leading-none flex items-center">‹</span>
            <span>Home</span>
          </button>
        }
        middleComponent={
          <h3 className="m-0 text-base font-semibold">
            {query}
          </h3>
        }
      />

      {/* Content */}
      <div className="p-5">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-5">
          {/* Column 1 */}
          <div className="flex flex-col gap-5">
            <AuctionResultsSection query={query} />
            <ResultsSection
              title="Lowest Buy It Now"
              items={allItems.slice(5, 10)}
              loading={loading}
              mode="bin"
            />
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-5">
            <ResultsSection
              title="Recent Sales"
              items={allItems.slice(10, 15)}
              loading={loading}
              mode="sold"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
