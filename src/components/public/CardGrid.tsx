import React from 'react';

interface CardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const CardGrid: React.FC<CardGridProps> = ({
  children,
  columns = 3,
  className = '',
}) => {
  const colClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={`grid gap-6 sm:gap-8 ${colClasses} ${className}`}>
      {children}
    </div>
  );
};
