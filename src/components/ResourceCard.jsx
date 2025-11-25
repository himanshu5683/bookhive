import React, { useState } from 'react';
import '../styles/ResourceCard.css';

const ResourceCard = ({ resource }) => {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloaded(!downloaded);
  };

  const typeLabel = resource.type === 'note' ? '📝 Note' : '📄 PDF';
  const stars = Math.round(resource.rating);

  return (
    <div className="resource-card">
      <div className="resource-header">
        <span className="resource-type">{typeLabel}</span>
        <span className="resource-credits">+{resource.credits} pts</span>
      </div>

      <h3 className="resource-title">{resource.emoji} {resource.title}</h3>
      <p className="resource-author">by {resource.author}</p>

      <p className="resource-description">{resource.description}</p>

      <div className="resource-meta">
        <div className="meta-item">
          <span className="rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < stars ? 'star filled' : 'star'}>★</span>
            ))}
            <span className="rating-text">{resource.rating}</span>
          </span>
        </div>
        <div className="meta-item">
          <span className="downloads">⬇️ {resource.downloads.toLocaleString()}</span>
        </div>
        {resource.pages && <div className="meta-item"><span>📄 {resource.pages} pages</span></div>}
      </div>

      <div className="resource-footer">
        <button
          className={`btn ${downloaded ? 'btn-downloaded' : 'btn-download'}`}
          onClick={handleDownload}
        >
          {downloaded ? '✓ Downloaded' : 'Download'}
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;
