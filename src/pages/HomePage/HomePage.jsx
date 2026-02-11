import * as React from 'react';
import SearchSection from './SearchSection.jsx';
import SavedItemsList from './SavedItemsList.jsx';
import DeleteDatabaseButton from '../../components/DeleteDatabaseButton.jsx';

const HomePage = () => {
  const isDevelopment = process.env.IS_DEVELOPMENT === 'true';

  return (
    <div className="p-5">
      <SearchSection />
      <SavedItemsList />

      {isDevelopment && (
        <div className="mt-8">
          <DeleteDatabaseButton />
        </div>
      )}
    </div>
  );
};

export default HomePage;
