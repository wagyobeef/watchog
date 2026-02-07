import * as React from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
  const handleClick = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/ebay/oauth');
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error fetching test endpoint:', error);
    }
  };

  return (
    <div>
      <h2>Hello from React!!!</h2>
      <button onClick={handleClick}>Click Me</button>
    </div>
  );
};

const root = createRoot(document.body);
root.render(<App />);
