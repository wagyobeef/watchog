import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage.jsx';
import SearchResultsPage from './pages/SearchResultsPage/SearchResultsPage.jsx';

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
      </Routes>
    </HashRouter>
  );
};

const root = createRoot(document.body);
root.render(<App />);
