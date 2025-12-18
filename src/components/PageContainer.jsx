import React from 'react';
import '../styles/PageContainer.css';

const PageContainer = ({ 
  children, 
  className = '', 
  title, 
  subtitle,
  ...props 
}) => {
  const containerClasses = ['page-container', className].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} {...props}>
      {(title || subtitle) && (
        <div className="page-header">
          {title && <h1 className="page-title">{title}</h1>}
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;