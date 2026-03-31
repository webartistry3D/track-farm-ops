import React from 'react';
import { 
  getResponsiveSkeleton,
  SKELETON_DIMENSIONS,
  getResponsiveGrid
} from './SkeletonDesignSystem';
import { 
  SkeletonElement, 
  CardSkeleton, 
  PageSkeleton
} from './SkeletonComponents';

// Engineering-precise Dashboard Skeleton
export const DashboardSkeleton: React.FC = () => (
  <PageSkeleton>
    {/* Welcome Section - Matches exact Dashboard layout */}
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <SkeletonElement 
            className={getResponsiveSkeleton(SKELETON_DIMENSIONS.dashboard.welcomeSection)} 
          />
        </div>
        <div className="flex space-x-2">
          <SkeletonElement className="w-8 h-8 rounded-lg" />
          <SkeletonElement className="w-8 h-8 rounded-lg" />
        </div>
      </div>
    </div>

    {/* Stats Cards Grid - Responsive 2x2 grid */}
    <div className={getResponsiveGrid(
      'grid grid-cols-1 gap-4 mb-6',
      'md:grid-cols-2 gap-6',
      'lg:grid-cols-2 gap-6'
    )}>
      {[...Array(4)].map((_, i) => (
        <CardSkeleton key={i} className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <SkeletonElement className="h-4 w-20 mb-2" />
              <SkeletonElement 
                className={getResponsiveSkeleton(SKELETON_DIMENSIONS.dashboard.statsCard)} 
              />
            </div>
            <div className="relative">
              <SkeletonElement className="w-10 h-10 rounded-lg" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </CardSkeleton>
      ))}
    </div>

    {/* Quick Actions Section */}
    <CardSkeleton className="mb-6">
      <SkeletonElement className="h-6 w-32 mb-4" />
      <div className={getResponsiveGrid(
        'grid grid-cols-2 gap-3',
        'sm:grid-cols-2 gap-4',
        'lg:grid-cols-4 gap-6'
      )}>
        {[...Array(4)].map((_, i) => (
          <SkeletonElement key={i} className="h-12 rounded-xl" />
        ))}
      </div>
    </CardSkeleton>

    {/* Recent Activity Section */}
    <div>
      <SkeletonElement className="h-6 w-32 mb-4" />
      <CardSkeleton>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <SkeletonElement className="w-10 h-10 rounded-lg" />
              <div className="flex-1">
                <SkeletonElement className="h-4 w-3/4 mb-1" />
                <SkeletonElement className="h-3 w-1/2" />
              </div>
              <SkeletonElement className="w-8 h-8 rounded-lg" />
            </div>
          ))}
        </div>
      </CardSkeleton>
    </div>
  </PageSkeleton>
);

// Engineering-precise Inventory Skeleton
export const InventorySkeleton: React.FC = () => (
  <PageSkeleton>
    {/* Stats Overview - 2-column responsive grid */}
    <div className={getResponsiveGrid(
      'grid grid-cols-1 gap-4 mb-6',
      'md:grid-cols-2 gap-6',
      'lg:grid-cols-2 gap-6'
    )}>
      {[...Array(2)].map((_, i) => (
        <CardSkeleton key={i}>
          <div className="flex items-center justify-between mb-4">
            <SkeletonElement className="h-4 w-24 mb-2" />
            <SkeletonElement className="w-8 h-8 rounded-lg" />
          </div>
          <SkeletonElement 
            className={getResponsiveSkeleton(SKELETON_DIMENSIONS.inventory.statsCard)} 
          />
        </CardSkeleton>
      ))}
    </div>

    {/* Tab Navigation */}
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 mb-6">
      <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0">
        <div className="flex overflow-x-auto justify-between">
          <div className="flex overflow-x-auto">
            {[...Array(3)].map((_, i) => (
              <SkeletonElement key={i} className="h-12 w-20 mr-2 rounded-t-lg" />
            ))}
          </div>
          <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
            <SkeletonElement className="w-8 h-8 rounded-lg" />
            <SkeletonElement className="w-8 h-8 rounded-lg" />
          </div>
        </div>
      </div>
    </div>

    {/* Filters Section */}
    <CardSkeleton className="mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SkeletonElement className="h-10 w-full rounded-lg" />
        </div>
        <SkeletonElement className="h-10 w-32 rounded-lg" />
        <SkeletonElement className="h-10 w-32 rounded-lg" />
        <div className="flex items-center space-x-2">
          <SkeletonElement className="w-8 h-8 rounded-lg" />
          <SkeletonElement className="w-8 h-8 rounded-lg" />
        </div>
      </div>
    </CardSkeleton>

    {/* Items Grid - Responsive 1-2-3 columns */}
    <div className={getResponsiveGrid(
      'grid grid-cols-1 gap-4',
      'md:grid-cols-2 gap-6',
      'lg:grid-cols-3 gap-6'
    )}>
      {[...Array(6)].map((_, i) => (
        <CardSkeleton key={i} className="group hover:shadow-xl transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <SkeletonElement className="h-6 w-3/4 mb-2" />
              <SkeletonElement className="h-4 w-1/2 mb-2" />
              <SkeletonElement className="h-3 w-2/3" />
            </div>
            <SkeletonElement className="w-8 h-8 rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <SkeletonElement className="h-3 w-16" />
              <SkeletonElement className="h-3 w-12" />
            </div>
            <div className="flex justify-between">
              <SkeletonElement className="h-3 w-20" />
              <SkeletonElement className="h-3 w-16" />
            </div>
            <div className="flex justify-between">
              <SkeletonElement className="h-3 w-14" />
              <SkeletonElement className="h-3 w-20" />
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <SkeletonElement className="h-8 w-8 rounded-lg" />
            <SkeletonElement className="h-8 w-8 rounded-lg" />
            <SkeletonElement className="h-8 w-8 rounded-lg" />
          </div>
        </CardSkeleton>
      ))}
    </div>
  </PageSkeleton>
);

// Engineering-precise Assets Skeleton
export const AssetsSkeleton: React.FC = () => (
  <PageSkeleton>
    {/* Search and Filter Section */}
    <CardSkeleton className="mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SkeletonElement className="h-10 w-full rounded-lg" />
        </div>
        <SkeletonElement className="h-10 w-32 rounded-lg" />
        <SkeletonElement className="h-10 w-32 rounded-lg" />
        <div className="flex items-center space-x-2">
          <SkeletonElement className="w-8 h-8 rounded-lg" />
          <SkeletonElement className="w-8 h-8 rounded-lg" />
        </div>
      </div>
    </CardSkeleton>

    {/* Tab Navigation */}
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 mb-6">
      <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0">
        <div className="flex overflow-x-auto justify-between">
          <div className="flex overflow-x-auto">
            {[...Array(4)].map((_, i) => (
              <SkeletonElement key={i} className="h-12 w-24 mr-2 rounded-t-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* KPI Cards - 2x4 responsive grid */}
    <div className={getResponsiveGrid(
      'grid grid-cols-1 gap-4 mb-6',
      'md:grid-cols-2 gap-4',
      'lg:grid-cols-4 gap-6'
    )}>
      {[...Array(4)].map((_, i) => (
        <CardSkeleton key={i}>
          <div className="flex items-center justify-between mb-4">
            <SkeletonElement className="h-4 w-20 mb-2" />
            <SkeletonElement className="w-8 h-8 rounded-lg" />
          </div>
          <SkeletonElement 
            className={getResponsiveSkeleton(SKELETON_DIMENSIONS.assets.kpiCard)} 
          />
        </CardSkeleton>
      ))}
    </div>

    {/* Assets Overview Table */}
    <CardSkeleton className="mb-6">
      <div className="flex items-center justify-between mb-6">
        <SkeletonElement className="h-6 w-32 mb-2" />
        <div className="flex space-x-2">
          <SkeletonElement className="w-8 h-8 rounded-lg" />
          <SkeletonElement className="w-8 h-8 rounded-lg" />
        </div>
      </div>
      {/* Responsive table skeleton */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="grid gap-4 p-4" style={{ gridTemplateColumns: 'repeat(9, minmax(0, 1fr))' }}>
              {[...Array(9)].map((_, i) => (
                <SkeletonElement key={i} className="h-4" />
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(10)].map((_, rowIndex) => (
              <div key={rowIndex} className="grid gap-4 p-4" style={{ gridTemplateColumns: 'repeat(9, minmax(0, 1fr))' }}>
                {[...Array(9)].map((_, colIndex) => (
                  <SkeletonElement key={colIndex} className="h-4" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardSkeleton>

    {/* Maintenance Schedule */}
    <CardSkeleton className="mb-6">
      <SkeletonElement className="h-6 w-40 mb-4" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-3 rounded-lg">
            <SkeletonElement className="w-10 h-10 rounded-lg" />
            <div className="flex-1">
              <SkeletonElement className="h-4 w-3/4" />
            </div>
            <SkeletonElement className="w-8 h-8 rounded-lg" />
          </div>
        ))}
      </div>
    </CardSkeleton>
  </PageSkeleton>
);

// Engineering-precise Analytics Skeleton
export const AnalyticsSkeleton: React.FC = () => (
  <PageSkeleton>
    {/* Date Filter Section */}
    <CardSkeleton className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <SkeletonElement className="h-10 w-32 rounded-lg" />
        <SkeletonElement className="h-10 w-40 rounded-lg" />
        <SkeletonElement className="h-10 w-32 rounded-lg" />
      </div>
    </CardSkeleton>

    {/* Financial Overview Cards */}
    <div className="mb-8">
      <SkeletonElement className="h-6 w-32 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <CardSkeleton key={i}>
            <SkeletonElement className="h-6 w-24 mb-4" />
            <SkeletonElement 
              className={getResponsiveSkeleton(SKELETON_DIMENSIONS.analytics.metricCard)} 
            />
          </CardSkeleton>
        ))}
      </div>
    </div>

    {/* Charts Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Income Chart */}
      <CardSkeleton>
        <SkeletonElement className="h-6 w-32 mb-4" />
        <SkeletonElement 
          className={getResponsiveSkeleton(SKELETON_DIMENSIONS.analytics.chartContainer)} 
        />
      </CardSkeleton>

      {/* Expense Chart */}
      <CardSkeleton>
        <SkeletonElement className="h-6 w-32 mb-4" />
        <SkeletonElement 
          className={getResponsiveSkeleton(SKELETON_DIMENSIONS.analytics.chartContainer)} 
        />
      </CardSkeleton>
    </div>

    {/* Inventory Overview Cards */}
    <div className="mb-8">
      <SkeletonElement className="h-6 w-32 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <CardSkeleton key={i}>
            <SkeletonElement className="h-6 w-20 mb-4" />
            <SkeletonElement 
              className={getResponsiveSkeleton(SKELETON_DIMENSIONS.analytics.metricCard)} 
            />
          </CardSkeleton>
        ))}
      </div>
    </div>
  </PageSkeleton>
);

// Engineering-precise Reports Skeleton
export const ReportsSkeleton: React.FC = () => (
  <PageSkeleton>
    {/* Date Filter Section */}
    <CardSkeleton className="mb-6">
      <div className="flex flex-wrap gap-2 items-center">
        <SkeletonElement className="h-10 w-20 rounded-lg" />
        <SkeletonElement className="h-10 w-32 rounded-lg" />
        <SkeletonElement className="h-10 w-32 rounded-lg" />
        <SkeletonElement className="h-10 w-24 rounded-lg" />
        <div className="flex space-x-2">
          <SkeletonElement className="w-8 h-8 rounded-lg" />
          <SkeletonElement className="w-8 h-8 rounded-lg" />
        </div>
      </div>
    </CardSkeleton>

    {/* Report Tabs */}
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 mb-6">
      <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0">
        <div className="flex overflow-x-auto justify-between">
          <div className="flex overflow-x-auto">
            {[...Array(3)].map((_, i) => (
              <SkeletonElement key={i} className="h-12 w-24 mr-2 rounded-t-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* All Transactions Table */}
    <CardSkeleton className="mb-6">
      <div className="flex items-center justify-between mb-6">
        <SkeletonElement className="h-6 w-32 mb-2" />
        <div className="flex space-x-2">
          <SkeletonElement className="w-8 h-8 rounded-lg" />
          <SkeletonElement className="w-8 h-8 rounded-lg" />
        </div>
      </div>
      
      {/* Table with responsive columns */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="grid gap-4 p-4" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}>
              {[...Array(6)].map((_, i) => (
                <SkeletonElement key={i} className="h-4" />
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(8)].map((_, rowIndex) => (
              <div key={rowIndex} className="grid gap-4 p-4" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}>
                {[...Array(6)].map((_, colIndex) => (
                  <SkeletonElement key={colIndex} className="h-4" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Pagination Skeleton */}
      <div className="mt-6 flex items-center justify-between">
        <SkeletonElement className="h-4 w-32" />
        <div className="flex gap-2">
          <SkeletonElement className="w-8 h-8 rounded-lg" />
          <SkeletonElement className="w-8 h-8 rounded-lg" />
        </div>
      </div>
    </CardSkeleton>
  </PageSkeleton>
);
