import React from 'react';
import '../styles/BookCard.css';

const Star = ({ filled }) => (
  <span className={filled ? 'star filled' : 'star'}>★</span>
);

const BookCard = ({ book = {}, onRead = () => {}, onSave = () => {}, isSaved = false }) => {
  const {
    title = 'Untitled',
    author = 'Unknown Author',
    description = 'No description available',
    emoji = '📕',
    rating = 0,
    cover = null,
  } = book;

  const renderCover = () => {
    if (cover) {
      return <img src={cover} alt={title} className="book-cover-img" />;
    }
    // fallback emoji cover
    return <div className="book-cover-emoji">{emoji}</div>;
  };

  return (
    <div className="book-card">
      <div className="book-cover">{renderCover()}</div>
      <div className="book-content">
        <h3 className="book-title">{title}</h3>
        <p className="book-author">by {author}</p>
        <p className="book-desc">{description}</p>

        <div className="book-rating" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} filled={i < Math.round(rating)} />
          ))}
          <span className="rating-num">{rating ? rating.toFixed(1) : '—'}</span>
        </div>
      </div>
      <div className="book-footer">
        <button className="book-btn book-btn-read" onClick={onRead}>
          Read
        </button>
        <button
          className={`book-btn ${isSaved ? 'book-btn-saved' : 'book-btn-save'}`}
          onClick={onSave}
        >
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default BookCard;
