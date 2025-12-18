import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../auth/AuthContext';
import { resourcesService } from '../../services/api'; // Fixed: Import resourcesService instead of apiClient
import Rating from './Rating';
import { getToken } from '../../utils/auth';
import Card from '../../components/Card';
import '../../styles/ResourceCard.css';

const ResourceCard = ({ resource, showRating = false }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Check if the resource can be previewed (PDF or image)
  const isPreviewable = resource.mimeType && 
    (resource.mimeType.startsWith('image/') || resource.mimeType === 'application/pdf');

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
      // Note: With blob response, we can't access JSON data directly
      // In a real implementation, you might need a separate endpoint to get updated credits
      
      // Create a download link
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = resource.originalName || resource.fileName || resource.title;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Show success message
      alert(`Resource downloaded successfully!`);
    } catch (err) {
      console.error('Failed to download resource:', err);
      alert('Failed to download resource: ' + (err.message || 'Please try again'));
    } finally {
      setDownloading(false);
    }
  };

  const handleOpen = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Get the auth token
    const token = getToken();
    
    // Open the view endpoint in a new tab
    const viewUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/resources/${resource._id}/view?token=${token}`;
    window.open(viewUrl, '_blank');
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
    <Card className="resource-card">
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
        {isPreviewable && (
          <button
            className="btn btn-open"
            onClick={handleOpen}
          >
            Open
          </button>
        )}
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
    </Card>
  );
};

export default ResourceCard;