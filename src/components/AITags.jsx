import React from "react";
import "../styles/AI.css";

const AITags = ({ 
  tags = [], 
  onTagClick = null, 
  className = "",
  maxTags = null,
  showCount = false
}) => {
  const displayedTags = maxTags ? tags.slice(0, maxTags) : tags;
  const remainingCount = maxTags && tags.length > maxTags ? tags.length - maxTags : 0;

  return (
    <div className={`ai-tags ${className}`}>
      <div className="tags-container">
        {displayedTags.map((tag, index) => (
          <span 
            key={index}
            className={`ai-tag badge ${onTagClick ? 'clickable' : ''}`}
            onClick={onTagClick ? () => onTagClick(tag) : undefined}
          >
            {tag}
          </span>
        ))}
        
        {remainingCount > 0 && (
          <span className="ai-tag badge badge-secondary">
            +{remainingCount} more
          </span>
        )}
      </div>
      
      {showCount && tags.length > 0 && (
        <div className="tags-count">
          {tags.length} {tags.length === 1 ? 'tag' : 'tags'}
        </div>
      )}
    </div>
  );
};

export default AITags;