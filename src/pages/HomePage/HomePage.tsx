import * as React from 'react';
import SearchSection from './SearchSection.tsx';
import SavedItemsList from './SavedItemsList.tsx';
import DeleteDatabaseButton from '../../components/DeleteDatabaseButton.tsx';

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
