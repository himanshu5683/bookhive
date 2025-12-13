import React, { useState, useContext } from 'react'; // Fixed: Add missing imports
import AuthContext from '../../auth/AuthContext'; // Fixed: Add missing import
import { resourcesService } from '../../services/api'; // Fixed: Import resourcesService instead of apiClient
import '../../styles/Rating.css';

const Rating = ({ resourceId, initialRating = 0, onRatingChange }) => {
  const { user } = useContext(AuthContext); // Fixed: Add missing useContext import
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRating = async (newRating) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    if (newRating === rating) {
      // If clicking the same star, deselect it (set to 0)
      newRating = 0;
    }

    setRating(newRating);
    setLoading(true);
    setError('');

    try {
      // Submit rating to backend using the correct service method
      const response = await resourcesService.rate(resourceId, { rating: newRating }); // Fixed: Use resourcesService instead of apiClient
      
      // Notify parent component of rating change
      if (onRatingChange) {
        onRatingChange(response.averageRating, response.totalRatings);
      }
    } catch (err) {
      console.error('Failed to submit rating:', err);
      setError('Failed to submit rating. Please try again.');
      // Revert rating on error
      setRating(initialRating);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rating-component">
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`star ${star <= (hoverRating || rating) ? 'filled' : 'empty'}`}
            onClick={() => handleRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            disabled={loading}
            aria-label={`Rate ${star} stars`}
          >
            ★
          </button>
        ))}
      </div>
      
      {loading && <span className="rating-loading">Submitting...</span>}
      {error && <span className="rating-error">{error}</span>}
    </div>
  );
};

export default Rating;