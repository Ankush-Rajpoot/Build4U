import React from 'react';
import { 
  TextSkeleton, 
  AvatarSkeleton, 
  ButtonSkeleton, 
  CardSkeleton, 
  InputSkeleton, 
  IconSkeleton, 
  StatSkeleton 
} from './Skeleton';

// Worker stats skeleton (matches the WorkerStats component structure)
export const WorkerStatsSkeleton = () => (
  <div className="relative">
    {/* Mobile compact layout skeleton */}
    <div className="grid grid-cols-2 gap-2 sm:hidden relative z-10 mb-3 h-24">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gradient-to-br from-white to-gray-50 dark:from-dark-surface dark:to-dark-card p-2.5 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border h-full flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0">
              <IconSkeleton size="sm" />
            </div>
            <div className="text-right flex-1 ml-2 min-w-0">
              <TextSkeleton lines={1} className="w-12 mb-1" />
              <TextSkeleton lines={1} className="w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Desktop layout skeleton */}
    <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 relative z-10 mb-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-dark-surface p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-gray-100 dark:bg-gray-700 mr-3 sm:mr-4">
              <IconSkeleton size="lg" />
            </div>
            <div className="flex-1">
              <TextSkeleton lines={1} className="w-20 mb-2" />
              <TextSkeleton lines={1} className="w-16" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full mb-2" />
            <TextSkeleton lines={1} className="w-24" />
          </div>
        </div>
      ))}
    </div>

    {/* Detailed ratings bar skeleton */}
    <div className="w-full justify-center mt-2 hidden sm:flex">
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-sm flex items-center justify-center px-4 py-2 max-w-xl w-full">
        <TextSkeleton lines={1} className="w-24 mr-4" />
        <div className="flex items-center gap-x-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-1">
              <IconSkeleton size="sm" />
              <TextSkeleton lines={1} className="w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Payment history skeleton
export const PaymentHistorySkeleton = () => (
  <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
    {/* Header */}
    <div className="p-6 border-b border-gray-200 dark:border-dark-border">
      <div className="flex justify-between items-center mb-4">
        <TextSkeleton lines={1} className="w-32" />
        <ButtonSkeleton size="sm" />
      </div>
      
      {/* Tab navigation skeleton */}
      <div className="bg-gray-50 dark:bg-dark-card rounded-lg p-1 mb-4">
        <div className="flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-1 py-2 px-3 rounded-md">
              <TextSkeleton lines={1} className="w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
    
    {/* Content */}
    <div className="p-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-50 dark:bg-dark-card p-4 rounded-lg border border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <TextSkeleton lines={1} className="w-16 mb-1" />
                <TextSkeleton lines={1} className="w-12" />
              </div>
              <IconSkeleton size="md" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Transaction list */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-50 dark:bg-dark-card p-4 rounded-lg border border-gray-200 dark:border-dark-border">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <IconSkeleton size="md" />
                <div>
                  <TextSkeleton lines={1} className="w-32 mb-1" />
                  <TextSkeleton lines={1} className="w-20" />
                </div>
              </div>
              <div className="text-right">
                <TextSkeleton lines={1} className="w-16 mb-1" />
                <TextSkeleton lines={1} className="w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Payment modal skeleton
export const PaymentModalSkeleton = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-md mx-4">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-dark-border">
        <div className="flex justify-between items-center">
          <TextSkeleton lines={1} className="w-32" />
          <IconSkeleton size="sm" />
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="space-y-4">
          {/* Payment info */}
          <div className="bg-gray-50 dark:bg-dark-card p-4 rounded-lg">
            <TextSkeleton lines={1} className="w-24 mb-2" />
            <TextSkeleton lines={1} className="w-20 mb-2" />
            <TextSkeleton lines={1} className="w-16" />
          </div>
          
          {/* Amount */}
          <div>
            <TextSkeleton lines={1} className="w-16 mb-2" />
            <InputSkeleton />
          </div>
          
          {/* Description */}
          <div>
            <TextSkeleton lines={1} className="w-20 mb-2" />
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-6 border-t border-gray-200 dark:border-dark-border">
        <div className="flex space-x-3">
          <ButtonSkeleton size="md" className="flex-1" />
          <ButtonSkeleton size="md" className="flex-1" />
        </div>
      </div>
    </div>
  </div>
);

// Service request card skeleton
export const ServiceRequestCardSkeleton = () => (
  <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <TextSkeleton lines={1} className="w-48" />
      <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
        <TextSkeleton lines={1} className="w-16" />
      </div>
    </div>
    
    <TextSkeleton lines={2} className="mb-4" />
    
    <div className="flex flex-wrap gap-2 mb-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 rounded-full">
          <TextSkeleton lines={1} className="w-12" />
        </div>
      ))}
    </div>
    
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <IconSkeleton size="sm" />
          <TextSkeleton lines={1} className="w-16" />
        </div>
        <div className="flex items-center space-x-1">
          <IconSkeleton size="sm" />
          <TextSkeleton lines={1} className="w-20" />
        </div>
      </div>
      <ButtonSkeleton size="sm" />
    </div>
  </div>
);

// Worker card skeleton
export const WorkerCardSkeleton = () => (
  <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
    <div className="flex items-center space-x-4 mb-4">
      <AvatarSkeleton size="lg" />
      <div className="flex-1">
        <TextSkeleton lines={1} className="w-32 mb-1" />
        <TextSkeleton lines={1} className="w-24 mb-2" />
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <IconSkeleton key={i} size="sm" />
          ))}
          <TextSkeleton lines={1} className="w-8 ml-2" />
        </div>
      </div>
    </div>
    
    <TextSkeleton lines={2} className="mb-4" />
    
    <div className="flex flex-wrap gap-2 mb-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900/20 rounded-full">
          <TextSkeleton lines={1} className="w-16" />
        </div>
      ))}
    </div>
    
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <IconSkeleton size="sm" />
          <TextSkeleton lines={1} className="w-12" />
        </div>
        <div className="flex items-center space-x-1">
          <IconSkeleton size="sm" />
          <TextSkeleton lines={1} className="w-8" />
        </div>
      </div>
      <ButtonSkeleton size="sm" />
    </div>
  </div>
);

// Chat message skeleton
export const ChatMessageSkeleton = ({ isOwn = false }) => (
  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
      isOwn 
        ? 'bg-blue-500 text-white' 
        : 'bg-gray-100 dark:bg-dark-card text-gray-900 dark:text-dark-text'
    }`}>
      <TextSkeleton lines={1} className="w-32 mb-1" />
      <TextSkeleton lines={1} className="w-16" />
    </div>
  </div>
);

// File upload skeleton
export const FileUploadSkeleton = () => (
  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
    <IconSkeleton size="xl" className="mx-auto mb-4" />
    <TextSkeleton lines={1} className="w-32 mb-2" />
    <TextSkeleton lines={1} className="w-48 mb-4" />
    <ButtonSkeleton size="md" className="mx-auto" />
  </div>
);

// Search bar skeleton
export const SearchBarSkeleton = () => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <IconSkeleton size="sm" />
    </div>
    <InputSkeleton className="pl-10 pr-4" />
  </div>
);

// Filter panel skeleton
export const FilterPanelSkeleton = () => (
  <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
    <div className="flex justify-between items-center mb-4">
      <TextSkeleton lines={1} className="w-16" />
      <ButtonSkeleton size="sm" />
    </div>
    
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i}>
          <TextSkeleton lines={1} className="w-20 mb-2" />
          <div className="space-y-2">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <TextSkeleton lines={1} className="w-24" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    
    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-border">
      <ButtonSkeleton size="full" />
    </div>
  </div>
);

// Pagination skeleton
export const PaginationSkeleton = () => (
  <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border sm:px-6">
    <div className="flex justify-between flex-1 sm:hidden">
      <ButtonSkeleton size="sm" />
      <ButtonSkeleton size="sm" />
    </div>
    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <TextSkeleton lines={1} className="w-48" />
      </div>
      <div className="flex items-center space-x-2">
        <ButtonSkeleton size="sm" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ))}
        <ButtonSkeleton size="sm" />
      </div>
    </div>
  </div>
);

// Loading screen skeleton
export const LoadingScreenSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-background flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto mb-4" />
      <TextSkeleton lines={1} className="w-32 mb-2" />
      <TextSkeleton lines={1} className="w-24" />
    </div>
  </div>
);

export default {
  WorkerStatsSkeleton,
  PaymentHistorySkeleton,
  PaymentModalSkeleton,
  ServiceRequestCardSkeleton,
  WorkerCardSkeleton,
  ChatMessageSkeleton,
  FileUploadSkeleton,
  SearchBarSkeleton,
  FilterPanelSkeleton,
  PaginationSkeleton,
  LoadingScreenSkeleton
};
