import * as React from 'react';

const DeleteDatabaseButton = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleReset = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset the database? This will delete all saved searches and cannot be undone.'
    );

    if (!confirmed) return;

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/resetDatabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert('Database reset successfully! Reloading...');
        window.location.reload();
      } else {
        alert('Failed to reset database: ' + data.error);
      }
    } catch (error) {
      console.error('Error resetting database:', error);
      alert('Failed to reset database.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleReset}
      disabled={isLoading}
      className="px-4 py-2 text-sm cursor-pointer bg-[#9B1D20] text-white border-0 rounded hover:bg-[#7A1719] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Resetting...' : 'Reset Database'}
    </button>
  );
};

export default DeleteDatabaseButton;
