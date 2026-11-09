import React from 'react';

function Card({ title, children, className = '', icon, variant }) {
  const variantClass = variant ? `card-${variant}` : '';

  return (
    <div className={`card ${variantClass} ${className}`}>
      {title && (
        <div className="card-header">
          {icon && icon}
          {title}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

export default Card;

