import React from 'react';

function Badge({ children, variant = 'default', pulse = false }) {
  const classes = `badge badge-${variant} ${pulse ? 'badge-pulse' : ''}`;
  return <span className={classes}>{children}</span>;
}

export default Badge;

