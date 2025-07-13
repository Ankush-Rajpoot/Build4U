import React, { useState, useEffect, useRef } from 'react';
import { IndianRupee, Star, Clock, CheckCircle, Award, MessageSquare, Users, Briefcase, Calendar, AlertCircle } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { serviceRequestService } from '../../services/serviceRequestService';
import { authService } from '../../services/authService';
import { reviewService } from '../../services/reviewService';
import { WorkerStatsSkeleton } from '../shared/skeletons';

const WorkerStats = () => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    activeJobs: 0,
    completedJobs: 0,
    rating: { average: 0, count: 0 },
    earnings: { thisMonth: 0, total: 0 }
  });
  const [reviewStats, setReviewStats] = useState({
    averageWorkQuality: 0,
    averageCommunication: 0,
    averageTimeliness: 0,
    averageProfessionalism: 0
  });
  const [loading, setLoading] = useState(true);

  const ratingCardRef = useRef(null);
  const detailedRatingRef = useRef(null);
  const [arrowPos, setArrowPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const activeJobsResponse = await serviceRequestService.getWorkerJobs();
        const allJobs = activeJobsResponse.data.serviceRequests || [];
        const activeJobs = allJobs.filter(job =>
          job.status === 'accepted' || job.status === 'in-progress'
        );

        const completedJobsResponse = await serviceRequestService.getCompletedJobs();
        const completedJobs = completedJobsResponse.data.serviceRequests || [];

        const profileResponse = await authService.getWorkerProfile();
        const workerProfile = profileResponse.data.worker;

        // Get worker statistics that include earnings
        const statsResponse = await authService.getWorkerStats();
        const workerStats = statsResponse.data.stats || {};
        
        // console.log('Worker Profile:', workerProfile);
        // console.log('Worker Stats:', workerStats);
        // console.log('Earnings from profile:', workerProfile?.earnings);
        // console.log('Total earned from stats:', workerStats.totalEarned);

        let reviewStatsData = {
          averageWorkQuality: 0,
          averageCommunication: 0,
          averageTimeliness: 0,
          averageProfessionalism: 0
        };
        if (workerProfile?._id) {
          const reviewRes = await reviewService.getWorkerReviews(workerProfile._id);
          if (reviewRes?.data?.statistics) {
            reviewStatsData = {
              averageWorkQuality: reviewRes.data.statistics.averageWorkQuality || 0,
              averageCommunication: reviewRes.data.statistics.averageCommunication || 0,
              averageTimeliness: reviewRes.data.statistics.averageTimeliness || 0,
              averageProfessionalism: reviewRes.data.statistics.averageProfessionalism || 0
            };
          }
        }

        setStats({
          activeJobs: activeJobs.length,
          completedJobs: completedJobs.length,
          rating: workerProfile?.rating || { average: 0, count: 0 },
          earnings: {
            thisMonth: workerProfile?.earnings?.thisMonth || 0,
            total: workerStats.totalEarned || workerProfile?.earnings?.total || 0
          }
        });
        setReviewStats(reviewStatsData);
      } catch (error) {
        console.error('Failed to fetch worker stats:', error);
        setStats({
          activeJobs: 0,
          completedJobs: user?.completedJobs || 0,
          rating: user?.rating || { average: 0, count: 0 },
          earnings: {
            thisMonth: user?.earnings?.thisMonth || 0,
            total: user?.earnings?.total || 0
          }
        });
        setReviewStats({
          averageWorkQuality: 0,
          averageCommunication: 0,
          averageTimeliness: 0,
          averageProfessionalism: 0
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    const updateArrowPosition = () => {
      // Additional safety checks to prevent runtime errors
      if (!ratingCardRef.current || 
          !detailedRatingRef.current || 
          !ratingCardRef.current.offsetParent ||
          !document.contains(ratingCardRef.current) ||
          !document.contains(detailedRatingRef.current)) {
        return;
      }

      try {
        const ratingRect = ratingCardRef.current.getBoundingClientRect();
        const detailRect = detailedRatingRef.current.getBoundingClientRect();
        const offsetParent = ratingCardRef.current.offsetParent;
        
        // Double-check offsetParent is valid before calling getBoundingClientRect
        if (!offsetParent || !document.contains(offsetParent)) {
          return;
        }
        
        const containerRect = offsetParent.getBoundingClientRect();

        // Shift up and towards left a bit
        const top = ratingRect.bottom - containerRect.top - 14;
        const left = ratingRect.left - containerRect.left + 10;
        const width = detailRect.left - ratingRect.left + 80;

        setArrowPos({ top, left, width });
      } catch (error) {
        console.warn('Error updating arrow position:', error);
      }
    };

    // Only update arrow position if not on mobile (where detailed rating is hidden)
    if (window.innerWidth >= 768) {
      updateArrowPosition();
      window.addEventListener('resize', updateArrowPosition);
      return () => window.removeEventListener('resize', updateArrowPosition);
    }
  }, [loading]);

  // All hooks must be declared before any early returns
  if (loading) {
    return <WorkerStatsSkeleton />;
  }

  const formatRating = (rating) => {
    if (typeof rating !== 'number' || isNaN(rating)) return 'N/A';
    return rating > 0 ? rating.toFixed(1) : '0.0';
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingBgColor = (rating) => {
    if (rating >= 4.5) return 'bg-green-100';
    if (rating >= 4.0) return 'bg-blue-100';
    if (rating >= 3.5) return 'bg-yellow-100';
    if (rating >= 3.0) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <div className="relative">
      {/* Desktop arrow connection - hidden on mobile */}
      <div
        className="hidden lg:block absolute z-0 pointer-events-none"
        style={{
          top: `${arrowPos.top}px`,
          left: `${arrowPos.left}px`,
          width: `${arrowPos.width}px`,
          height: '70px'
        }}
      >
        <svg width={arrowPos.width} height="50" viewBox={`0 0 ${arrowPos.width} 70`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 0 V45" stroke="#22c55e" strokeWidth="2.5" fill="none" />
          <path d="M30 45 Q30 65, 80 65" stroke="#22c55e" strokeWidth="2.5" fill="none" />
          <path d={`M80 65 H${arrowPos.width - 30}`} stroke="#22c55e" strokeWidth="2.5" fill="none" />
          <polygon points={`${arrowPos.width - 30},60 ${arrowPos.width - 20},65 ${arrowPos.width - 30},70`} fill="#22c55e" />
        </svg>
      </div>

      {/* Mobile compact layout - 2x2 grid - Professional design with fixed height */}
      <div className="grid grid-cols-2 gap-2 sm:hidden relative z-10 mb-3 h-24">
        {/* Rating Card - Compact */}
        <div className="bg-gradient-to-br from-white to-gray-50 dark:bg-gradient-to-br dark:from-dark-surface dark:to-gray-900/10 p-2.5 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md dark:hover:shadow-lg transition-all duration-200 h-full flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className={`p-1.5 rounded-lg ${getRatingBgColor(stats.rating.average)} dark:bg-yellow-900/30 flex-shrink-0`}>
              <Star className={`h-3 w-3 ${getRatingColor(stats.rating.average)} dark:text-yellow-400 fill-current`} />
            </div>
            <div className="text-right flex-1 ml-2 min-w-0">
              <p className="text-xs text-gray-600 dark:text-dark-text-secondary font-medium leading-none">Rating</p>
              <p className={`text-base font-bold leading-tight ${getRatingColor(stats.rating.average)} dark:text-yellow-400`}>
                {formatRating(stats.rating.average)}
              </p>
              {stats.rating.count > 0 && (
                <p className="text-xs text-gray-500 dark:text-dark-text-muted leading-none">({stats.rating.count})</p>
              )}
            </div>
          </div>
        </div>

        {/* Earnings Card - Compact */}
        <div className="bg-gradient-to-br from-white to-green-50 dark:bg-gradient-to-br dark:from-dark-surface dark:to-green-900/10 p-2.5 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md dark:hover:shadow-lg transition-all duration-200 h-full flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 flex-shrink-0">
              <IndianRupee className="h-3 w-3 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-right flex-1 ml-2 min-w-0">
              <p className="text-xs text-gray-600 dark:text-dark-text-secondary font-medium leading-none">Total</p>
              <p className="text-base font-bold text-green-700 dark:text-green-400 truncate leading-tight">
                ₹{stats.earnings.total > 999 
                  ? `${Math.floor(stats.earnings.total / 1000)}k` 
                  : stats.earnings.total?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        {/* Active Jobs Card - Compact */}
        <div className="bg-gradient-to-br from-white to-yellow-50 dark:bg-gradient-to-br dark:from-dark-surface dark:to-yellow-900/10 p-2.5 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md dark:hover:shadow-lg transition-all duration-200 h-full flex flex-col justify-center">
          <div className="flex items-center justify-between w-full">
            <div className="p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex-shrink-0">
              <Clock className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-right flex-1 ml-2 min-w-0">
              <p className="text-xs text-gray-600 dark:text-dark-text-secondary font-medium leading-none">Active</p>
              <p className="text-base font-bold text-yellow-700 dark:text-yellow-400 leading-tight">{stats.activeJobs}</p>
            </div>
          </div>
          <div className="w-full h-1 bg-gray-200 dark:bg-dark-border rounded-full mt-1.5">
            <div
              className={`h-1 rounded-full transition-all duration-300 ${
                stats.activeJobs === 0 ? 'bg-green-400 dark:bg-green-500' : 
                stats.activeJobs <= 2 ? 'bg-yellow-400 dark:bg-yellow-500' : 'bg-orange-400 dark:bg-orange-500'
              }`}
              style={{ width: `${Math.min((stats.activeJobs / 5) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Completed Jobs Card - Compact */}
        <div className="bg-gradient-to-br from-white to-blue-50 dark:bg-gradient-to-br dark:from-dark-surface dark:to-blue-900/10 p-2.5 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md dark:hover:shadow-lg transition-all duration-200 h-full flex flex-col justify-center">
          <div className="flex items-center justify-between w-full">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
              <CheckCircle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-right flex-1 ml-2 min-w-0">
              <p className="text-xs text-gray-600 dark:text-dark-text-secondary font-medium leading-none">Done</p>
              <p className="text-base font-bold text-blue-700 dark:text-blue-400 leading-tight">{stats.completedJobs}</p>
            </div>
          </div>
          {stats.completedJobs > 0 && (
            <div className="w-full h-1 bg-gray-200 dark:bg-dark-border rounded-full mt-1.5">
              <div className="h-1 bg-blue-400 dark:bg-blue-500 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
            </div>
          )}
        </div>
      </div>

      {/* Tablet and Desktop layout */}
      <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 relative z-10 mb-2">
        <div ref={ratingCardRef} className="bg-white dark:bg-dark-surface p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md dark:hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className={`p-2 sm:p-3 rounded-full ${getRatingBgColor(stats.rating.average)} mr-3 sm:mr-4`}>
              <Star className={`h-5 w-5 sm:h-6 sm:w-6 ${getRatingColor(stats.rating.average)} fill-current`} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-dark-text-secondary">Overall Rating</p>
              <div className="flex items-center space-x-2">
                <p className={`text-xl sm:text-2xl font-semibold ${getRatingColor(stats.rating.average)}`}>
                  {formatRating(stats.rating.average)}
                </p>
                {stats.rating.average > 0 && (
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 sm:h-4 sm:w-4 ${
                          star <= Math.round(stats.rating.average)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-dark-border'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="h-1 w-full bg-gray-200 dark:bg-dark-border rounded-full">
              <div
                className={`h-1 rounded-full transition-all duration-500 ${
                  stats.rating.average >= 4.5
                    ? 'bg-green-500 dark:bg-green-400'
                    : stats.rating.average >= 4.0
                    ? 'bg-blue-500 dark:bg-blue-400'
                    : stats.rating.average >= 3.5
                    ? 'bg-yellow-500 dark:bg-yellow-400'
                    : stats.rating.average >= 3.0
                    ? 'bg-orange-500 dark:bg-orange-400'
                    : 'bg-red-500 dark:bg-red-400'
                }`}
                style={{ width: `${(stats.rating.average / 5) * 100}%` }}
              ></div>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-dark-text-muted">
              {stats.rating.count > 0
                ? `Based on ${stats.rating.count} review${stats.rating.count !== 1 ? 's' : ''}`
                : 'No reviews yet'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface p-3 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md dark:hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-green-100 dark:bg-green-900/30 mr-3 sm:mr-4">
              <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-dark-text-secondary">Total Earnings</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-dark-text-primary">
                ₹{stats.earnings.total?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="h-1 w-full bg-gray-200 dark:bg-dark-border rounded-full">
              <div className="h-1 bg-green-500 dark:bg-green-400 rounded-full" style={{ width: '70%' }}></div>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-dark-text-muted">This Month: ₹{stats.earnings.thisMonth?.toLocaleString() || '0'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface p-3 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md dark:hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mr-3 sm:mr-4">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-dark-text-secondary">Active Jobs</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-dark-text-primary">{stats.activeJobs}</p>
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-dark-text-muted">
              <span>Current workload</span>
              <span>{stats.activeJobs > 0 ? 'In progress' : 'Available'}</span>
            </div>
            <div className="mt-1 h-1 w-full bg-gray-200 dark:bg-dark-border rounded-full">
              <div
                className={`h-1 rounded-full ${
                  stats.activeJobs === 0
                    ? 'bg-green-500 dark:bg-green-400'
                    : stats.activeJobs <= 2
                    ? 'bg-yellow-500 dark:bg-yellow-400'
                    : stats.activeJobs <= 4
                    ? 'bg-orange-500 dark:bg-orange-400'
                    : 'bg-red-500 dark:bg-red-400'
                }`}
                style={{ width: `${Math.min((stats.activeJobs / 5) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface p-3 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md dark:hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-3 sm:mr-4">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-dark-text-secondary">Completed Jobs</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-dark-text-primary">{stats.completedJobs}</p>
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="h-1 w-full bg-gray-200 dark:bg-dark-border rounded-full">
              <div className="h-1 bg-purple-500 dark:bg-purple-400 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-dark-text-muted">
              {stats.completedJobs > 0
                ? `${stats.completedJobs} job${stats.completedJobs !== 1 ? 's' : ''} completed successfully`
                : 'No completed jobs yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed ratings bar - hidden on mobile for space */}
      <div className="w-full justify-center mt-2 hidden sm:flex">
        <div
          ref={detailedRatingRef}
          className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-sm flex flex-wrap items-center justify-center px-4 py-2"
          style={{ minHeight: '44px', maxWidth: '600px', width: '100%' }}
        >
          <span className="text-xs font-semibold text-gray-700 dark:text-dark-text mr-4">Detailed Ratings:</span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center space-x-1">
              <Award className="h-4 w-4 text-gray-500 dark:text-dark-text-secondary" />
              <span className="text-xs text-gray-700 dark:text-dark-text">Quality</span>
              <span className="font-semibold text-gray-900 dark:text-dark-text-primary ml-1">{formatRating(reviewStats.averageWorkQuality)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4 text-gray-500 dark:text-dark-text-secondary" />
              <span className="text-xs text-gray-700 dark:text-dark-text">Comm.</span>
              <span className="font-semibold text-gray-900 dark:text-dark-text-primary ml-1">{formatRating(reviewStats.averageCommunication)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-gray-500 dark:text-dark-text-secondary" />
              <span className="text-xs text-gray-700 dark:text-dark-text">Time</span>
              <span className="font-semibold text-gray-900 dark:text-dark-text-primary ml-1">{formatRating(reviewStats.averageTimeliness)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4 text-gray-500 dark:text-dark-text-secondary" />
              <span className="text-xs text-gray-700 dark:text-dark-text">Prof.</span>
              <span className="font-semibold text-gray-900 dark:text-dark-text-primary ml-1">{formatRating(reviewStats.averageProfessionalism)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerStats;
