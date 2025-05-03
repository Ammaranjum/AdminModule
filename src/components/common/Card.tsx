import React, { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, footer, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="px-6 py-4">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;