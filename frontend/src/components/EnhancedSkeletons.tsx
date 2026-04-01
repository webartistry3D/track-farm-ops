import React from 'react';
import {
  getResponsiveSkeleton,
  SKELETON_DIMENSIONS
} from './SkeletonDesignSystem';
import { 
  SkeletonElement, 
  CardSkeleton, 
  PageSkeleton
} from './SkeletonComponents';

// Engineering-precise Dashboard Skeleton - Matches exact Dashboard page layout
export const DashboardSkeleton: React.FC = () => (
  <PageSkeleton>
    <div className="space-y-6">
      {/* Welcome Section - Simple text without background card */}
      <div className="rounded-lg p-0">
        <SkeletonElement className="h-7 w-32 mb-1" />
        <SkeletonElement className="h-4 w-48" />
      </div>

      {/* Stats Cards Grid - 2x2 grid only for owners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Card */}
        <CardSkeleton className="group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-3 dark:border-green-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-col space-y-1 flex-1">
              <SkeletonElement className="h-4 w-16 mb-1" />
              <div className="flex items-center space-x-2">
                <SkeletonElement className="w-1 h-1 rounded-full" />
                <SkeletonElement className="h-3 w-24" />
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <SkeletonElement className="w-8 h-8 rounded-lg" />
            </div>
          </div>
          <div className="flex items-center">
            <SkeletonElement className="h-8 w-32" />
          </div>
        </CardSkeleton>
        
        {/* Expenses Card */}
        <CardSkeleton className="group bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-3 dark:border-red-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-col space-y-1 flex-1">
              <SkeletonElement className="h-4 w-20 mb-1" />
              <div className="flex items-center space-x-2">
                <SkeletonElement className="w-1 h-1 rounded-full" />
                <SkeletonElement className="h-3 w-28" />
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <SkeletonElement className="w-8 h-8 rounded-lg" />
            </div>
          </div>
          <div className="flex items-center">
            <SkeletonElement className="h-8 w-32" />
          </div>
        </CardSkeleton>
        
        {/* VAT Card */}
        <CardSkeleton className="group bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-3 dark:border-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-col space-y-1 flex-1">
              <SkeletonElement className="h-4 w-8 mb-1" />
              <div className="flex items-center space-x-2">
                <SkeletonElement className="w-1 h-1 rounded-full" />
                <SkeletonElement className="h-3 w-32" />
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <SkeletonElement className="w-8 h-8 rounded-lg" />
            </div>
          </div>
          <div className="flex items-center">
            <SkeletonElement className="h-8 w-28" />
          </div>
        </CardSkeleton>
        
        {/* Net Profit Card */}
        <CardSkeleton className="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 dark:border-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-col space-y-1 flex-1">
              <SkeletonElement className="h-4 w-20 mb-1" />
              <div className="flex items-center space-x-2">
                <SkeletonElement className="w-1 h-1 rounded-full" />
                <SkeletonElement className="h-3 w-36" />
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <SkeletonElement className="w-8 h-8 rounded-lg" />
            </div>
          </div>
          <div className="flex items-center">
            <SkeletonElement className="h-8 w-32" />
          </div>
        </CardSkeleton>
      </div>

      {/* Financial Overview Section */}
      <CardSkeleton className="shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col gap-4">
          {/* Section Title */}
          <SkeletonElement className="h-6 w-32" />
          
          {/* Date Filter Buttons */}
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center gap-2 min-w-max">
              {[...Array(8)].map((_, i) => (
                <SkeletonElement key={i} className="flex-shrink-0 h-8 w-16 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </CardSkeleton>
    </div>
  </PageSkeleton>
);

// Engineering-precise Inventory Skeleton - Matches exact Inventory page layout
export const InventorySkeleton: React.FC = () => (
  <PageSkeleton>
    <div className="w-full px-0 sm:px-0 lg:px-0 py-0">
      {/* Stats Overview - First Row: 4 columns with Total Value spanning 2 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Items Card */}
        <CardSkeleton className="cursor-pointer hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between p-6">
            <div className="flex-1">
              <SkeletonElement className="h-4 w-24 mb-2" />
              <SkeletonElement className="h-9 w-20" />
            </div>
            <SkeletonElement className="w-12 h-12 rounded-lg" />
          </div>
        </CardSkeleton>
        
        {/* Total Categories Card */}
        <CardSkeleton className="cursor-pointer hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between p-6">
            <div className="flex-1">
              <SkeletonElement className="h-4 w-32 mb-2" />
              <SkeletonElement className="h-9 w-20" />
            </div>
            <SkeletonElement className="w-12 h-12 rounded-lg" />
          </div>
        </CardSkeleton>
        
        {/* Total Value Card - Spans 2 columns on md */}
        <CardSkeleton className="md:col-span-2 cursor-pointer hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between p-6">
            <div className="flex-1">
              <SkeletonElement className="h-4 w-20 mb-2" />
              <SkeletonElement className="h-9 w-32" />
            </div>
            <SkeletonElement className="w-12 h-12 rounded-lg" />
          </div>
        </CardSkeleton>
      </div>

      {/* Stats Overview - Second Row: 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Livestock Card */}
        <CardSkeleton className="cursor-pointer hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between p-6">
            <div className="flex-1">
              <SkeletonElement className="h-4 w-20 mb-2" />
              <SkeletonElement className="h-9 w-16" />
            </div>
            <SkeletonElement className="w-12 h-12 rounded-lg" />
          </div>
        </CardSkeleton>
        
        {/* Produce Card */}
        <CardSkeleton className="cursor-pointer hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between p-6">
            <div className="flex-1">
              <SkeletonElement className="h-4 w-16 mb-2" />
              <SkeletonElement className="h-9 w-16" />
            </div>
            <SkeletonElement className="w-12 h-12 rounded-lg" />
          </div>
        </CardSkeleton>
        
        {/* Consumables Card */}
        <CardSkeleton className="cursor-pointer hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between p-6">
            <div className="flex-1">
              <SkeletonElement className="h-4 w-24 mb-2" />
              <SkeletonElement className="h-9 w-16" />
            </div>
            <SkeletonElement className="w-12 h-12 rounded-lg" />
          </div>
        </CardSkeleton>
        
        {/* Low Stock Items Card */}
        <CardSkeleton className="cursor-pointer hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between p-6">
            <div className="flex-1">
              <SkeletonElement className="h-4 w-28 mb-2" />
              <SkeletonElement className="h-9 w-16" />
            </div>
            <SkeletonElement className="w-12 h-12 rounded-lg" />
          </div>
        </CardSkeleton>
      </div>

      {/* Filters and Controls Section */}
      <CardSkeleton className="p-4 sm:p-6 mb-0">
        {/* Search Bar */}
        <div className="flex flex-col gap-4 mb-4">
          <div className="relative">
            <SkeletonElement className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
            <SkeletonElement className="w-full h-10 pl-10 pr-4 rounded-lg" />
          </div>
          
          {/* Action Buttons - Stack on mobile, row on larger screens */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Secondary Actions */}
            <div className="flex gap-2">
              <SkeletonElement className="w-10 h-10 rounded-lg" />
              <SkeletonElement className="w-10 h-10 rounded-lg" />
            </div>
            
            {/* Main Action Buttons */}
            <div className="flex gap-2 sm:gap-3 flex-1">
              <SkeletonElement className="flex-1 h-10 rounded-lg" />
              <SkeletonElement className="flex-1 h-10 rounded-lg" />
            </div>
          </div>
        </div>
        
        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          <SkeletonElement className="h-8 w-24 rounded-full" />
          <SkeletonElement className="h-8 w-20 rounded-full" />
          <SkeletonElement className="h-8 w-28 rounded-full" />
          <SkeletonElement className="h-8 w-16 rounded-full" />
        </div>
      </CardSkeleton>

      {/* Items Grid - Responsive 1-2-3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <CardSkeleton key={i} className="group hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              {/* Item Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <SkeletonElement className="h-6 w-3/4 mb-2" />
                  <SkeletonElement className="h-4 w-1/2 mb-2" />
                  <SkeletonElement className="h-3 w-2/3" />
                </div>
                <SkeletonElement className="w-8 h-8 rounded-lg" />
              </div>
              
              {/* Item Details */}
              <div className="space-y-3">
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
              
              {/* Action Buttons */}
              <div className="flex space-x-2 mt-4">
                <SkeletonElement className="h-8 w-8 rounded-lg" />
                <SkeletonElement className="h-8 w-8 rounded-lg" />
                <SkeletonElement className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          </CardSkeleton>
        ))}
      </div>
      
      {/* Pagination Skeleton */}
      <div className="mt-6 flex items-center justify-between">
        <SkeletonElement className="h-4 w-32" />
        <div className="flex gap-2">
          <SkeletonElement className="w-8 h-8 rounded-lg" />
          <SkeletonElement className="w-8 h-8 rounded-lg" />
          <SkeletonElement className="w-8 h-8 rounded-lg" />
          <SkeletonElement className="w-8 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  </PageSkeleton>
);

// Engineering-precise Assets Skeleton - Matches exact Assets page layout
export const AssetsSkeleton: React.FC = () => (
  <PageSkeleton>
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0 py-0">
        {/* Stats Cards - 2x2 grid on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-4">
          {/* Total Assets Card */}
          <CardSkeleton className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-lg shadow cursor-pointer hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <SkeletonElement className="w-10 h-10 lg:w-12 lg:h-12 rounded-full" />
              <div className="ml-3 lg:ml-4">
                <SkeletonElement className="h-3 lg:h-4 w-16 mb-2" />
                <SkeletonElement className="h-8 lg:h-9 w-12" />
              </div>
            </div>
          </CardSkeleton>
          
          {/* Active Assets Card */}
          <CardSkeleton className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-lg shadow cursor-pointer hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <SkeletonElement className="w-10 h-10 lg:w-12 lg:h-12 rounded-full" />
              <div className="ml-3 lg:ml-4">
                <SkeletonElement className="h-3 lg:h-4 w-12 mb-2" />
                <SkeletonElement className="h-8 lg:h-9 w-12" />
              </div>
            </div>
          </CardSkeleton>
          
          {/* Maintenance Card */}
          <CardSkeleton className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-lg shadow cursor-pointer hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <SkeletonElement className="w-10 h-10 lg:w-12 lg:h-12 rounded-full" />
              <div className="ml-3 lg:ml-4">
                <SkeletonElement className="h-3 lg:h-4 w-20 mb-2" />
                <SkeletonElement className="h-8 lg:h-9 w-12" />
              </div>
            </div>
          </CardSkeleton>
          
          {/* Issues Card */}
          <CardSkeleton className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-lg shadow cursor-pointer hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <SkeletonElement className="w-10 h-10 lg:w-12 lg:h-12 rounded-full" />
              <div className="ml-3 lg:ml-4">
                <SkeletonElement className="h-3 lg:h-4 w-12 mb-2" />
                <SkeletonElement className="h-8 lg:h-9 w-12" />
              </div>
            </div>
          </CardSkeleton>
        </div>

        {/* Filters and Search Section */}
        <CardSkeleton className="bg-white dark:bg-gray-800 rounded-xl border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:flex-wrap sm:gap-4 sm:items-center">
              {/* Search Bar */}
              <div className="w-full sm:flex-1 sm:min-w-64">
                <div className="relative">
                  <SkeletonElement className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
                  <SkeletonElement className="w-full h-10 pl-10 pr-4 rounded-lg" />
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="flex flex-col sm:flex-row sm:gap-4 space-y-2 sm:space-y-0 w-full sm:w-auto">
                <SkeletonElement className="w-full sm:w-auto h-10 px-3 rounded-lg" />
              </div>
            </div>
          </div>
        </CardSkeleton>

        {/* Assets Table */}
        <CardSkeleton className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mt-4">
          <div className="overflow-x-auto">
            <div className="min-w-[700px] w-full">
              {/* Table Header */}
              <div className="bg-gray-50 dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <div className="grid gap-4 px-2 sm:px-3 py-3" style={{ gridTemplateColumns: 'repeat(9, minmax(0, 1fr))' }}>
                  <SkeletonElement className="h-3 w-12" />
                  <SkeletonElement className="h-3 w-16" />
                  <SkeletonElement className="h-3 w-8" />
                  <SkeletonElement className="h-3 w-12 hidden lg:block" />
                  <SkeletonElement className="h-3 w-16 hidden lg:block" />
                  <SkeletonElement className="h-3 w-8" />
                  <SkeletonElement className="h-3 w-10" />
                  <SkeletonElement className="h-3 w-16 hidden lg:block" />
                  <SkeletonElement className="h-3 w-16" />
                </div>
              </div>
              
              {/* Table Rows */}
              <div className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(8)].map((_, rowIndex) => (
                  <div key={rowIndex} className="hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <div className="grid gap-4 px-2 sm:px-3 py-3 sm:py-4" style={{ gridTemplateColumns: 'repeat(9, minmax(0, 1fr))' }}>
                      {/* Asset Column */}
                      <div className="flex items-center">
                        <SkeletonElement className="text-lg sm:text-xl mr-2 sm:mr-3 w-6 h-6" />
                        <div className="flex-1 min-w-0">
                          <SkeletonElement className="h-4 w-3/4 mb-1" />
                          <SkeletonElement className="h-3 w-1/2" />
                        </div>
                      </div>
                      
                      {/* Category Column */}
                      <SkeletonElement className="h-4 w-16" />
                      
                      {/* Cost Column */}
                      <SkeletonElement className="h-4 w-12" />
                      
                      {/* Location Column (hidden on mobile) */}
                      <SkeletonElement className="h-4 w-20 hidden lg:block" />
                      
                      {/* Created By Column (hidden on mobile) */}
                      <SkeletonElement className="h-4 w-16 hidden lg:block" />
                      
                      {/* Date Column */}
                      <SkeletonElement className="h-4 w-16" />
                      
                      {/* Status Column */}
                      <SkeletonElement className="h-4 w-16" />
                      
                      {/* Last Update Column (hidden on mobile) */}
                      <SkeletonElement className="h-4 w-20 hidden lg:block" />
                      
                      {/* Actions Column */}
                      <div className="flex space-x-2">
                        <SkeletonElement className="w-6 h-6 rounded" />
                        <SkeletonElement className="w-6 h-6 rounded" />
                        <SkeletonElement className="w-6 h-6 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardSkeleton>
      </div>
    </div>
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
