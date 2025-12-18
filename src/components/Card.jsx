import React from 'react';
import '../styles/Card.css';

const Card = ({ children, className = '', elevated = false, compact = false, ...props }) => {
  const cardClasses = [
    'card',
    elevated ? 'card-elevated' : '',
    compact ? 'card-compact' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;