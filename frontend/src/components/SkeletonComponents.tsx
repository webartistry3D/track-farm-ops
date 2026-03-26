import React from 'react';

// Base skeleton element with consistent styling
export const SkeletonElement: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = ({ className = '', children }) => (
  <div 
    className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}
    role="status"
    aria-label="Loading"
  >
    {children}
  </div>
);

// Card skeleton component
export const CardSkeleton: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = ({ className = '', children }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

// Stats card skeleton
export const StatsCardSkeleton: React.FC<{
  icon?: boolean;
  className?: string;
}> = ({ icon = true, className = '' }) => (
  <CardSkeleton className={className}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <SkeletonElement className="h-4 w-24 mb-2" />
        <SkeletonElement className="h-8 w-16" />
      </div>
      {icon && <SkeletonElement className="w-12 h-12 rounded-lg" />}
    </div>
  </CardSkeleton>
);

// Table skeleton
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden ${className}`}>
    {/* Table Header */}
    <div className="border-b border-gray-200 dark:border-gray-700">
      <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {[...Array(columns)].map((_, i) => (
          <SkeletonElement key={i} className="h-4" />
        ))}
      </div>
    </div>
    
    {/* Table Rows */}
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {[...Array(columns)].map((_, colIndex) => (
            <SkeletonElement key={colIndex} className="h-4" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Grid skeleton for cards/items
export const GridSkeleton: React.FC<{
  items?: number;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  children?: React.ReactNode;
}> = ({ items = 6, columns = 3, className = '', children }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {[...Array(items)].map((_, i) => (
        <CardSkeleton key={i}>
          {children || (
            <>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <SkeletonElement className="h-6 w-3/4 mb-2" />
                  <SkeletonElement className="h-4 w-1/2" />
                </div>
                <SkeletonElement className="w-8 h-8 rounded-lg" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <SkeletonElement className="h-4 w-20" />
                  <SkeletonElement className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <SkeletonElement className="h-4 w-24" />
                  <SkeletonElement className="h-4 w-20" />
                </div>
                <div className="flex justify-between">
                  <SkeletonElement className="h-4 w-16" />
                  <SkeletonElement className="h-4 w-24" />
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <SkeletonElement className="h-8 w-8 rounded-lg" />
                <SkeletonElement className="h-8 w-8 rounded-lg" />
                <SkeletonElement className="h-8 w-8 rounded-lg" />
              </div>
            </>
          )}
        </CardSkeleton>
      ))}
    </div>
  );
};

// List skeleton for vertical layouts
export const ListSkeleton: React.FC<{
  items?: number;
  className?: string;
  children?: React.ReactNode;
}> = ({ items = 5, className = '', children }) => (
  <div className={`space-y-4 ${className}`}>
    {[...Array(items)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        {children || (
          <div className="flex items-center space-x-4">
            <SkeletonElement className="w-12 h-12 rounded-lg" />
            <div className="flex-1">
              <SkeletonElement className="h-4 w-3/4 mb-2" />
              <SkeletonElement className="h-4 w-1/2" />
            </div>
            <SkeletonElement className="w-8 h-8 rounded-lg" />
          </div>
        )}
      </div>
    ))}
  </div>
);

// Tab navigation skeleton
export const TabSkeleton: React.FC<{
  tabs?: number;
  className?: string;
}> = ({ tabs = 3, className = '' }) => (
  <div className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 mb-6 ${className}`}>
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="flex overflow-x-auto justify-between">
        <div className="flex overflow-x-auto">
          {[...Array(tabs)].map((_, i) => (
            <SkeletonElement key={i} className="h-12 w-20 mr-2" />
          ))}
        </div>
        <div className="flex items-center space-x-2 ml-4 flex-shrink-0 h-full mt-3">
          <SkeletonElement className="w-8 h-8 rounded-lg" />
          <SkeletonElement className="w-8 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

// Filter/search skeleton
export const FilterSkeleton: React.FC<{
  inputs?: number;
  className?: string;
}> = ({ inputs = 3, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 shadow-lg p-6 mb-0 ${className}`}>
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1">
        <SkeletonElement className="h-10 w-full rounded-lg" />
      </div>
      {[...Array(inputs)].map((_, i) => (
        <SkeletonElement key={i} className="h-10 w-32 rounded-lg" />
      ))}
      <div className="flex items-center space-x-2">
        <SkeletonElement className="w-8 h-8 rounded-lg" />
        <SkeletonElement className="w-8 h-8 rounded-lg" />
      </div>
    </div>
  </div>
);

// Chart skeleton
export const ChartSkeleton: React.FC<{
  className?: string;
  height?: string;
}> = ({ className = '', height = 'h-64' }) => (
  <CardSkeleton className={className}>
    <SkeletonElement className={`h-6 w-32 mb-4`} />
    <div className={`${height} bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse`} />
  </CardSkeleton>
);

// Form skeleton
export const FormSkeleton: React.FC<{
  fields?: number;
  className?: string;
}> = ({ fields = 4, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
    <div className="space-y-4">
      {[...Array(fields)].map((_, i) => (
        <div key={i}>
          <SkeletonElement className="h-4 w-24 mb-2" />
          <SkeletonElement className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <div className="flex justify-end space-x-3 pt-4">
        <SkeletonElement className="h-10 w-24 rounded-lg" />
        <SkeletonElement className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  </div>
);

// Full page skeleton
export const PageSkeleton: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
    <div className="w-full px-4 sm:px-0 lg:px-0 py-6">
      {children}
    </div>
  </div>
);

// Loading spinner with text (fallback)
export const LoadingSpinner: React.FC<{
  text?: string;
  className?: string;
}> = ({ text = 'Loading...', className = '' }) => (
  <div className={`flex flex-col items-center justify-center py-12 space-y-4 ${className}`}>
    <div className="relative">
      <div className="animate-spin w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 bg-green-600 rounded-full"></div>
      </div>
    </div>
    <div className="text-center space-y-2">
      <p className="text-gray-500 dark:text-gray-400">{text}</p>
      <p className="text-sm text-gray-400 dark:text-gray-500">Please wait while we fetch your data</p>
    </div>
  </div>
);

// Export all components for easy importing
export const SkeletonComponents = {
  SkeletonElement,
  CardSkeleton,
  StatsCardSkeleton,
  TableSkeleton,
  GridSkeleton,
  ListSkeleton,
  TabSkeleton,
  FilterSkeleton,
  ChartSkeleton,
  FormSkeleton,
  PageSkeleton,
  LoadingSpinner
};

export default SkeletonComponents;
