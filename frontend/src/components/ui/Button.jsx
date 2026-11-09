import React from 'react';

function Button({ children, onClick, variant = 'primary', size = 'md', disabled = false, className = '' }) {
  const classes = `btn btn-${variant} ${size !== 'md' ? `btn-${size}` : ''} ${className}`;
  return (
    <button className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export default Button;

