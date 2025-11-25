import React from 'react';
import '../styles/BookCard.css';

const BookCard = ({ book = {}, onRead = () => {}, onSave = () => {} }) => {
  const { title = 'Untitled', author = 'Unknown Author', description = 'No description available', emoji = '📕' } = book;

  return (
    <div className="book-card">
      <div className="book-cover">{emoji}</div>
      <div className="book-content">
        <h3 className="book-title">{title}</h3>
        <p className="book-author">by {author}</p>
        <p className="book-desc">{description}</p>
      </div>
      <div className="book-footer">
        <button className="book-btn book-btn-read" onClick={onRead}>
          Read
        </button>
        <button className="book-btn book-btn-save" onClick={onSave}>
          Save
        </button>
      </div>
    </div>
  );
};

export default BookCard;
