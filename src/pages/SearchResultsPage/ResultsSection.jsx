import * as React from 'react';

const ResultsSection = ({ title, items, loading }) => {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fff',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      height: '100%'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px', marginTop: 0 }}>
        {title}
      </h3>

      {loading && <p style={{ color: '#666' }}>Loading...</p>}

      {!loading && (!items || items.length === 0) && (
        <p style={{ color: '#666' }}>No results found.</p>
      )}

      {!loading && items && items.length > 0 && (

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item) => (
            <div
              key={item.itemId}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '6px',
                backgroundColor: '#fafafa'
              }}
            >
              {/* Image */}
              <div style={{ flexShrink: 0, width: '60px', height: '60px' }}>
                <img
                  src={item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl || ''}
                  alt={item.title}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    display: 'block',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ddd'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div style="width: 60px; height: 60px; background-color: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #999;">No Image</div>';
                  }}
                />
              </div>

              {/* Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                <h4 style={{
                  margin: 0,
                  fontSize: '13px',
                  lineHeight: '1.3',
                  fontWeight: '500',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {item.title}
                </h4>

                <div style={{ fontSize: '11px', color: '#666' }}>
                  {item.condition}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2a6496' }}>
                    ${parseFloat(item.price.value).toFixed(2)}
                  </div>
                </div>

                <a
                  href={item.itemWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: '500',
                    alignSelf: 'flex-start'
                  }}
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsSection;
