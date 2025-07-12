import React from 'react';
import { 
  TextSkeleton, 
  AvatarSkeleton, 
  ButtonSkeleton, 
  CardSkeleton, 
  InputSkeleton, 
  IconSkeleton, 
  StatSkeleton, 
  TabSkeleton, 
  TableSkeleton, 
  ListSkeleton, 
  FormSkeleton 
} from './Skeleton';

// Landing page skeleton
export const LandingSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-background">
    {/* Header */}
    <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border px-4 py-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <IconSkeleton size="lg" />
          <TextSkeleton lines={1} className="w-32" />
        </div>
        <div className="flex space-x-3">
          <ButtonSkeleton size="md" />
          <ButtonSkeleton size="md" />
        </div>
      </div>
    </div>
    
    {/* Hero section */}
    <div className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <TextSkeleton lines={2} className="mb-6" />
        <TextSkeleton lines={3} className="mb-8" />
        <div className="flex justify-center space-x-4">
          <ButtonSkeleton size="lg" />
          <ButtonSkeleton size="lg" />
        </div>
      </div>
    </div>
    
    {/* Features section */}
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <CardSkeleton key={i} className="text-center p-6">
              <IconSkeleton size="xl" className="mx-auto mb-4" />
              <TextSkeleton lines={1} className="mb-2" />
              <TextSkeleton lines={2} />
            </CardSkeleton>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Dashboard header skeleton
export const DashboardHeaderSkeleton = () => (
  <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border px-4 py-3">
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <IconSkeleton size="lg" />
        <TextSkeleton lines={1} className="w-32" />
      </div>
      <div className="flex items-center space-x-4">
        <IconSkeleton size="md" />
        <IconSkeleton size="md" />
        <AvatarSkeleton size="sm" />
      </div>
    </div>
  </div>
);

// Sidebar skeleton
export const SidebarSkeleton = () => (
  <div className="bg-white dark:bg-dark-surface w-64 border-r border-gray-200 dark:border-dark-border h-full">
    <div className="p-4">
      <div className="flex items-center space-x-3 mb-6">
        <AvatarSkeleton size="md" />
        <div className="flex-1">
          <TextSkeleton lines={1} className="w-24 mb-1" />
          <TextSkeleton lines={1} className="w-16" />
        </div>
      </div>
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-2 rounded-lg">
            <IconSkeleton size="sm" />
            <TextSkeleton lines={1} className="w-20" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Client dashboard skeleton
export const ClientDashboardSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-background">
    <DashboardHeaderSkeleton />
    <div className="flex">
      <SidebarSkeleton />
      <div className="flex-1 p-6">
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
        
        {/* Recent requests */}
        <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
          <div className="flex justify-between items-center mb-4">
            <TextSkeleton lines={1} className="w-32" />
            <ButtonSkeleton size="sm" />
          </div>
          <TableSkeleton rows={5} columns={4} />
        </div>
      </div>
    </div>
  </div>
);

// Worker dashboard skeleton
export const WorkerDashboardSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-background">
    <DashboardHeaderSkeleton />
    <div className="flex">
      <SidebarSkeleton />
      <div className="flex-1 p-6">
        {/* Worker stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
        
        {/* Detailed ratings */}
        <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-4 mb-6">
          <div className="flex items-center justify-center space-x-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <IconSkeleton size="sm" />
                <TextSkeleton lines={1} className="w-12" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Available jobs */}
        <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
          <div className="flex justify-between items-center mb-4">
            <TextSkeleton lines={1} className="w-32" />
            <ButtonSkeleton size="sm" />
          </div>
          <ListSkeleton items={5} />
        </div>
      </div>
    </div>
  </div>
);

// Request details skeleton
export const RequestDetailsSkeleton = () => (
  <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border max-w-4xl mx-auto">
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <TextSkeleton lines={1} className="w-64" />
        <IconSkeleton size="sm" />
      </div>
      
      {/* Tabs */}
      <TabSkeleton tabs={2} className="mb-6" />
      
      {/* Content */}
      <div className="space-y-6">
        {/* Overview */}
        <div className="bg-gray-50 dark:bg-dark-card p-4 rounded-lg">
          <TextSkeleton lines={1} className="w-24 mb-2" />
          <TextSkeleton lines={3} />
        </div>
        
        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-dark-card p-4 rounded-lg">
            <TextSkeleton lines={1} className="w-16 mb-2" />
            <div className="flex items-center space-x-2">
              <IconSkeleton size="sm" />
              <TextSkeleton lines={1} className="w-20" />
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-dark-card p-4 rounded-lg">
            <TextSkeleton lines={1} className="w-20 mb-2" />
            <div className="flex items-center space-x-2">
              <IconSkeleton size="sm" />
              <TextSkeleton lines={1} className="w-24" />
            </div>
          </div>
        </div>
        
        {/* Skills */}
        <div className="bg-gray-50 dark:bg-dark-card p-4 rounded-lg">
          <TextSkeleton lines={1} className="w-28 mb-3" />
          <div className="flex flex-wrap gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <TextSkeleton lines={1} className="w-16" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Timeline */}
        <div className="bg-gray-50 dark:bg-dark-card p-4 rounded-lg">
          <TextSkeleton lines={1} className="w-24 mb-3" />
          <div className="flex items-center justify-between">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <TextSkeleton lines={1} className="w-16 mb-1" />
                <TextSkeleton lines={1} className="w-12" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Payment center skeleton
export const PaymentCenterSkeleton = () => (
  <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <TextSkeleton lines={1} className="w-32" />
        <ButtonSkeleton size="sm" />
      </div>
      
      {/* Payment stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-50 dark:bg-dark-card p-4 rounded-lg">
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
      
      {/* Payment history */}
      <div className="space-y-3">
        <TextSkeleton lines={1} className="w-28 mb-3" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-50 dark:bg-dark-card p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <TextSkeleton lines={1} className="w-32 mb-1" />
                <TextSkeleton lines={1} className="w-20" />
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

// Message center skeleton
export const MessageCenterSkeleton = () => (
  <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border h-96">
    <div className="flex h-full">
      {/* Conversations list */}
      <div className="w-1/3 border-r border-gray-200 dark:border-dark-border p-4">
        <div className="flex justify-between items-center mb-4">
          <TextSkeleton lines={1} className="w-20" />
          <IconSkeleton size="sm" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-2 rounded-lg">
              <AvatarSkeleton size="sm" />
              <div className="flex-1">
                <TextSkeleton lines={1} className="w-20 mb-1" />
                <TextSkeleton lines={1} className="w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center space-x-3">
            <AvatarSkeleton size="sm" />
            <div className="flex-1">
              <TextSkeleton lines={1} className="w-24 mb-1" />
              <TextSkeleton lines={1} className="w-16" />
            </div>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 p-4 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className="max-w-xs">
                <div className="bg-gray-100 dark:bg-dark-card p-3 rounded-lg">
                  <TextSkeleton lines={1} className="w-32" />
                </div>
                <TextSkeleton lines={1} className="w-16 mt-1" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Message input */}
        <div className="p-4 border-t border-gray-200 dark:border-dark-border">
          <div className="flex items-center space-x-3">
            <InputSkeleton className="flex-1" />
            <ButtonSkeleton size="sm" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Profile skeleton
export const ProfileSkeleton = () => (
  <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
    <div className="flex items-center space-x-4 mb-6">
      <AvatarSkeleton size="xl" />
      <div className="flex-1">
        <TextSkeleton lines={1} className="w-32 mb-2" />
        <TextSkeleton lines={1} className="w-24 mb-1" />
        <TextSkeleton lines={1} className="w-20" />
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <TextSkeleton lines={1} className="w-24 mb-4" />
        <FormSkeleton fields={4} />
      </div>
      <div>
        <TextSkeleton lines={1} className="w-20 mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-card rounded-lg">
              <div className="flex items-center space-x-3">
                <IconSkeleton size="sm" />
                <TextSkeleton lines={1} className="w-20" />
              </div>
              <ButtonSkeleton size="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Notification skeleton
export const NotificationSkeleton = () => (
  <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
    <div className="p-4 border-b border-gray-200 dark:border-dark-border">
      <div className="flex justify-between items-center">
        <TextSkeleton lines={1} className="w-28" />
        <ButtonSkeleton size="sm" />
      </div>
    </div>
    <div className="max-h-96 overflow-y-auto">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="p-4 border-b border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card">
          <div className="flex items-start space-x-3">
            <IconSkeleton size="sm" className="mt-1" />
            <div className="flex-1">
              <TextSkeleton lines={1} className="w-48 mb-1" />
              <TextSkeleton lines={1} className="w-32 mb-2" />
              <TextSkeleton lines={1} className="w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Auth form skeleton
export const AuthFormSkeleton = () => (
  <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-8 max-w-md mx-auto">
    <div className="text-center mb-6">
      <IconSkeleton size="xl" className="mx-auto mb-4" />
      <TextSkeleton lines={1} className="w-32 mb-2" />
      <TextSkeleton lines={1} className="w-48" />
    </div>
    
    <FormSkeleton fields={4} />
    
    <div className="mt-6 text-center">
      <TextSkeleton lines={1} className="w-40" />
    </div>
  </div>
);

// Review skeleton
export const ReviewSkeleton = () => (
  <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
    <div className="flex items-center space-x-4 mb-4">
      <AvatarSkeleton size="md" />
      <div className="flex-1">
        <TextSkeleton lines={1} className="w-24 mb-1" />
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <IconSkeleton key={i} size="sm" />
          ))}
        </div>
      </div>
    </div>
    
    <TextSkeleton lines={3} className="mb-4" />
    
    <div className="grid grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="text-center">
          <TextSkeleton lines={1} className="w-16 mb-1" />
          <div className="flex justify-center space-x-1">
            {[...Array(5)].map((_, j) => (
              <IconSkeleton key={j} size="sm" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default {
  LandingSkeleton,
  DashboardHeaderSkeleton,
  SidebarSkeleton,
  ClientDashboardSkeleton,
  WorkerDashboardSkeleton,
  RequestDetailsSkeleton,
  PaymentCenterSkeleton,
  MessageCenterSkeleton,
  ProfileSkeleton,
  NotificationSkeleton,
  AuthFormSkeleton,
  ReviewSkeleton
};
