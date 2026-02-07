import * as React from 'react';

const TopBar = ({ leftComponent, middleComponent, rightComponent }) => {
  return (
    <div style={{
      padding: '15px 20px',
      backgroundColor: '#f5f5f5',
      borderBottom: '1px solid #ddd',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        {leftComponent}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {middleComponent}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        {rightComponent}
      </div>
    </div>
  );
};

export default TopBar;
