import React, { useState, useContext } from 'react';
import AuthContext from '../../auth/AuthContext';
import apiClient from '../../services/api';
import '../../styles/Rating.css';

const Rating = ({ resourceId, initialRating = 0, onRatingSubmit }) => {
  const { user, updateUserCredits } = useContext(AuthContext);
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to rate resources');
      return;
    }
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await apiClient.resourcesAPI.rate(resourceId, {
        userId: user.id,
        rating,
        review
      });
      
      // Update user credits in context
      if (response.newCredits !== undefined) {
        updateUserCredits(response.newCredits);
      }
      
      // Notify parent component
      if (onRatingSubmit) {
        onRatingSubmit(response.resource);
      }
      
      // Show success message
      alert(`Thank you for rating this resource! 10 credits awarded.`);
    } catch (err) {
      console.error('Failed to submit rating:', err);
      setError(err.message || 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rating-component">
      <h3>Rate this Resource</h3>
      
      <form onSubmit={handleRatingSubmit} className="rating-form">
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star-button ${star <= (hoverRating || rating) ? 'filled' : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`Rate ${star} stars`}
            >
              ★
            </button>
          ))}
          <span className="rating-text">
            {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select rating'}
          </span>
        </div>
        
        <div className="review-input">
          <label htmlFor="review">Review (optional)</label>
          <textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your thoughts about this resource..."
            maxLength={500}
            rows={3}
          />
          <div className="char-count">
            {review.length}/500 characters
          </div>
        </div>
        
        {error && <div className="rating-error">{error}</div>}
        
        <button 
          type="submit" 
          className="submit-rating-btn"
          disabled={isSubmitting || !user}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Rating'}
        </button>
      </form>
    </div>
  );
};

export default Rating;