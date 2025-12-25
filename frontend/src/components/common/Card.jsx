import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl border border-border-corporate shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

export default Card;