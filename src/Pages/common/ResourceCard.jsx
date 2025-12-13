import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../auth/AuthContext';
import { resourcesService } from '../../services/api'; // Fixed: Import resourcesService instead of apiClient
import Rating from './Rating';
import '../../styles/ResourceCard.css';

const ResourceCard = ({ resource, showRating = false }) => {
  const { user, updateUserCredits } = useContext(AuthContext);
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleDownload = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setDownloading(true);
    try {
      // Record download in backend using the correct service method
      const response = await resourcesService.download(resource._id, { userId: user.id });
      
      // Update user credits in context
      if (response.newCredits !== undefined) {
        updateUserCredits(response.newCredits);
      }
      
      // In a real app, this would trigger the actual download
      alert(`Resource downloaded! 50 credits deducted. New balance: ${response.newCredits || 'unknown'} credits.`);
    } catch (err) {
      console.error('Failed to download resource:', err);
      alert('Failed to download resource: ' + (err.message || 'Insufficient credits'));
    } finally {
      setDownloading(false);
    }
  };

  const handleRatingSubmit = (updatedResource) => {
    // Update the resource rating in the UI
    // In a real app, you would update the parent component's state
    console.log('Rating submitted for resource:', updatedResource);
  };

  const typeLabel = resource.type === 'note' ? '📝 Note' : 
                  resource.type === 'pdf' ? '📄 PDF' : 
                  resource.type === 'video' ? '🎬 Video' : '📄 Document';
  
  const stars = Math.round(resource.rating) || 0;

  // Truncate description for card view
  const truncateDescription = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="resource-card">
      <div className="resource-header">
        <span className="resource-type">{typeLabel}</span>
        {resource.isPremium ? (
          <span className="resource-credits premium">💎 {resource.premiumPrice} credits</span>
        ) : (
          <span className="resource-credits">💰 {resource.credits} credits</span>
        )}
      </div>

      <h3 className="resource-title">{resource.title}</h3>
      <p className="resource-author">by {resource.author}</p>
      
      {resource.category && (
        <span className="resource-category">{resource.category}</span>
      )}

      <p className="resource-description">
        {showFullDescription ? resource.description : truncateDescription(resource.description)}
        {resource.description.length > 100 && (
          <button 
            className="toggle-description"
            onClick={() => setShowFullDescription(!showFullDescription)}
          >
            {showFullDescription ? 'Show Less' : 'Show More'}
          </button>
        )}
      </p>
      
      {resource.tags && resource.tags.length > 0 && (
        <div className="resource-tags">
          {resource.tags.map((tag, index) => (
            <span key={index} className="resource-tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="resource-meta">
        <div className="meta-item">
          <span className="rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < stars ? 'star filled' : 'star'}>★</span>
            ))}
            <span className="rating-text">{resource.rating || 0} ({resource.ratings?.length || 0} ratings)</span>
          </span>
        </div>
        <div className="meta-item">
          <span className="downloads">⬇️ {(resource.downloads || 0).toLocaleString()}</span>
        </div>
        {resource.fileSize && (
          <div className="meta-item">
            <span>💾 {(resource.fileSize / 1024 / 1024).toFixed(1)} MB</span>
          </div>
        )}
      </div>

      <div className="resource-footer">
        <button
          className="btn btn-download"
          onClick={handleDownload}
          disabled={downloading || (user && user.credits < (resource.isPremium ? resource.premiumPrice : resource.credits))}
        >
          {downloading ? 'Downloading...' : 
           user && user.credits < (resource.isPremium ? resource.premiumPrice : resource.credits) ? 
           'Insufficient Credits' : 
           resource.isPremium ? 
           `Download (${resource.premiumPrice} credits)` : 
           `Download (${resource.credits} credits)`}
        </button>
      </div>

      {showRating && (
        <Rating 
          resourceId={resource._id} 
          initialRating={0}
          onRatingSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
};

export default ResourceCard;