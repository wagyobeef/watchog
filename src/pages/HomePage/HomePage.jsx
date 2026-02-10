import * as React from 'react';
import SearchSection from './SearchSection.jsx';
import SavedItemsList from './SavedItemsList.jsx';

const HomePage = () => {
  return (
    <div className="p-5">
      <SearchSection />
      <SavedItemsList />
    </div>
  );
};

export default HomePage;
