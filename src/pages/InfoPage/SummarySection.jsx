import * as React from 'react';
import { FiEdit2 } from 'react-icons/fi';

const SummarySection = ({ query, savedSearchId, savedSearch }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [yourCost, setYourCost] = React.useState('');
  const [tempCost, setTempCost] = React.useState('');

  React.useEffect(() => {
    if (savedSearch?.cost !== undefined && savedSearch?.cost !== null) {
      setYourCost(savedSearch.cost.toString());
      setTempCost(savedSearch.cost.toString());
    } else {
      setYourCost('');
      setTempCost('');
    }
  }, [savedSearch]);

  const handleEdit = () => {
    setTempCost(yourCost);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!savedSearchId) {
      alert('Cannot save cost: No saved search ID');
      setIsEditing(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/itemCost', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: parseInt(savedSearchId),
          cost: parseInt(tempCost) || 0
        }),
      });

      if (response.ok) {
        setYourCost(tempCost);
        setIsEditing(false);
      } else {
        const data = await response.json();
        alert('Failed to save cost: ' + data.error);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving cost:', error);
      alert('Failed to save cost.');
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempCost(yourCost);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 mt-0">
        Summary
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <div className="text-[13px] leading-snug font-medium text-gray-900">My Cost</div>
            {savedSearchId && (
              <button
                onClick={handleEdit}
                className="p-0.5 hover:bg-gray-200 rounded cursor-pointer border-0 bg-transparent transition-colors"
                aria-label="Edit your cost"
              >
                <FiEdit2 className="text-[11px] text-gray-600" />
              </button>
            )}
          </div>
          {!isEditing ? (
            <div className="text-lg font-semibold">
              {yourCost ? `$${yourCost}` : '--'}
            </div>
          ) : (
            <div className="flex items-center">
              <span className="text-lg font-semibold">$</span>
              <input
                type="number"
                step="1"
                value={tempCost}
                onChange={(e) => setTempCost(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                autoFocus
                className="w-20 text-lg font-semibold border border-gray-300 rounded px-1 ml-0.5"
              />
            </div>
          )}
        </div>

        <div>
          <div className="text-[13px] leading-snug font-medium text-gray-900 mb-1">Last Sale</div>
          <div className="text-lg font-semibold">$75</div>
        </div>

        <div>
          <div className="text-[13px] leading-snug font-medium text-gray-900 mb-1">Lowest BIN</div>
          <div className="text-lg font-semibold">$65</div>
        </div>

        <div>
          <div className="text-[13px] leading-snug font-medium text-gray-900 mb-1">Next Auction</div>
          <div className="text-lg font-semibold">$45</div>
        </div>
      </div>
    </div>
  );
};

export default SummarySection;
