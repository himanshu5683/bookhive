import React from 'react';
import '../styles/Section.css';

const Section = ({ 
  children, 
  className = '', 
  title, 
  subtitle, 
  actions,
  ...props 
}) => {
  const sectionClasses = ['section', className].filter(Boolean).join(' ');

  return (
    <section className={sectionClasses} {...props}>
      {(title || subtitle || actions) && (
        <div className="section-header">
          <div className="section-text">
            {title && <h2 className="section-title">{title}</h2>}
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="section-actions">{actions}</div>}
        </div>
      )}
      <div className="section-content">
        {children}
      </div>
    </section>
  );
};

export default Section;