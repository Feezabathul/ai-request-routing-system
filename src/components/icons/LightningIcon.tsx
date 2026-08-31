import React from 'react';

export const LightningIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Purple circle background */}
    <circle cx="100" cy="100" r="95" fill="#8B5CF6" />
    
    {/* White lightning bolt */}
    <path d="M 110 40 L 60 110 L 90 110 L 70 170 L 130 90 L 100 90 L 120 40 Z" fill="white" />
  </svg>
);

export default LightningIcon;
