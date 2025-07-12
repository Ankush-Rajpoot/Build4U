import React from 'react';
import RequestCard from './RequestCard';
import { RequestCardSkeleton } from './skeletons';

const RequestList = ({ requests, userRole, loading, onUpdate, onEdit, onView, onReview }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <RequestCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-surface p-8 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border text-center">
        <p className="text-gray-500 dark:text-dark-text-secondary">No service requests found.</p>
        {userRole === 'client' && (
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            Create a new request to get started.
          </p>
        )}
        {userRole === 'worker' && (
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            Check back later for new job opportunities.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3">
      {requests.map((request) => (
        <RequestCard 
          key={request._id} 
          request={request} 
          userRole={userRole}
          onUpdate={onUpdate}
          onEdit={onEdit}
          onView={onView}
          onReview={onReview}
        />
      ))}
    </div>
  );
};

export default RequestList;