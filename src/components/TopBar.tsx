import * as React from 'react';

const TopBar = ({ leftComponent, middleComponent, rightComponent }) => {
  return (
    <div className="px-5 py-4 bg-gray-100 border-b border-gray-300 flex items-center justify-between">
      <div className="flex-1 flex items-center">
        {leftComponent}
      </div>
      <div className="flex-1 flex items-center justify-center">
        {middleComponent}
      </div>
      <div className="flex-1 flex items-center justify-end">
        {rightComponent}
      </div>
    </div>
  );
};

export default TopBar;
