import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage.jsx';
import InfoPage from './pages/InfoPage/InfoPage.jsx';

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<InfoPage />} />
      </Routes>
    </HashRouter>
  );
};

const root = createRoot(document.body);
root.render(<App />);
