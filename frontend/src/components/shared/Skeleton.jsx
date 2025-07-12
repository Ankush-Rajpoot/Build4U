import React from 'react';

// Base skeleton component with animation
const Skeleton = ({ 
  className = '', 
  variant = 'rectangular', 
  width, 
  height, 
  children,
  animate = true 
}) => {
  const baseClasses = animate 
    ? 'animate-pulse bg-gray-200 dark:bg-gray-700' 
    : 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded',
    card: 'rounded-lg',
    button: 'rounded-md',
    avatar: 'rounded-full',
    input: 'rounded-md h-10'
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

// Skeleton for text lines
export const TextSkeleton = ({ lines = 1, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton 
        key={index} 
        variant="text" 
        className={`h-4 ${index === lines - 1 ? 'w-3/4' : 'w-full'}`} 
      />
    ))}
  </div>
);

// Skeleton for avatar
export const AvatarSkeleton = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };
  
  return (
    <Skeleton 
      variant="circular" 
      className={`${sizes[size]} ${className}`} 
    />
  );
};

// Skeleton for buttons
export const ButtonSkeleton = ({ size = 'md', variant = 'primary', className = '' }) => {
  const sizes = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32',
    full: 'h-10 w-full'
  };
  
  return (
    <Skeleton 
      variant="button" 
      className={`${sizes[size]} ${className}`} 
    />
  );
};

// Skeleton for cards
export const CardSkeleton = ({ className = '', children }) => (
  <div className={`bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4 shadow-sm ${className}`}>
    {children}
  </div>
);

// Skeleton for input fields
export const InputSkeleton = ({ className = '' }) => (
  <Skeleton 
    variant="input" 
    className={`w-full ${className}`} 
  />
);

// Skeleton for icons
export const IconSkeleton = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };
  
  return (
    <Skeleton 
      variant="rectangular" 
      className={`${sizes[size]} ${className}`} 
    />
  );
};

// Skeleton for stats/metrics
export const StatSkeleton = ({ className = '' }) => (
  <div className={`bg-white dark:bg-dark-surface p-4 rounded-lg border border-gray-200 dark:border-dark-border shadow-sm ${className}`}>
    <div className="flex items-center">
      <IconSkeleton size="lg" className="mr-3" />
      <div className="flex-1">
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-6 w-12" />
      </div>
    </div>
    <div className="mt-3">
      <Skeleton className="h-1 w-full rounded-full" />
      <Skeleton className="h-2 w-20 mt-2" />
    </div>
  </div>
);

// Skeleton for tabs
export const TabSkeleton = ({ tabs = 2, className = '' }) => (
  <div className={`border-b border-gray-200 dark:border-dark-border ${className}`}>
    <div className="flex space-x-8">
      {Array.from({ length: tabs }).map((_, index) => (
        <Skeleton key={index} className="h-8 w-20" />
      ))}
    </div>
  </div>
);

// Skeleton for tables
export const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden ${className}`}>
    {/* Header */}
    <div className="bg-gray-50 dark:bg-dark-card p-4 border-b border-gray-200 dark:border-dark-border">
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-4 flex-1" />
        ))}
      </div>
    </div>
    {/* Rows */}
    <div className="divide-y divide-gray-200 dark:divide-dark-border">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Skeleton for lists
export const ListSkeleton = ({ items = 5, showAvatar = true, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-3 p-3 bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
        {showAvatar && <AvatarSkeleton size="md" />}
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <IconSkeleton size="sm" />
      </div>
    ))}
  </div>
);

// Skeleton for forms
export const FormSkeleton = ({ fields = 3, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <InputSkeleton />
      </div>
    ))}
    <div className="flex space-x-3 pt-4">
      <ButtonSkeleton size="md" />
      <ButtonSkeleton size="md" />
    </div>
  </div>
);

// Skeleton for modals
export const ModalSkeleton = ({ className = '' }) => (
  <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
    <div className="bg-white dark:bg-dark-surface rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-6 w-32" />
        <IconSkeleton size="sm" />
      </div>
      <div className="space-y-4">
        <TextSkeleton lines={3} />
        <FormSkeleton fields={2} />
      </div>
    </div>
  </div>
);

export default Skeleton;
