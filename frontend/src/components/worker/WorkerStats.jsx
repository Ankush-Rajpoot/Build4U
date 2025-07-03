import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Star, Clock, CheckCircle, Award, MessageSquare, Users } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { serviceRequestService } from '../../services/serviceRequestService';
import { authService } from '../../services/authService';
import { reviewService } from '../../services/reviewService';

const WorkerStats = () => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    activeJobs: 0,
    completedJobs: 0,
    rating: { average: 0, count: 0 },
    earnings: { thisMonth: 0 }
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
          earnings: workerProfile?.earnings || { thisMonth: 0 }
        });
        setReviewStats(reviewStatsData);
      } catch (error) {
        console.error('Failed to fetch worker stats:', error);
        setStats({
          activeJobs: 0,
          completedJobs: user?.completedJobs || 0,
          rating: user?.rating || { average: 0, count: 0 },
          earnings: user?.earnings || { thisMonth: 0 }
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
      if (ratingCardRef.current && detailedRatingRef.current) {
        const ratingRect = ratingCardRef.current.getBoundingClientRect();
        const detailRect = detailedRatingRef.current.getBoundingClientRect();
        const containerRect = ratingCardRef.current.offsetParent.getBoundingClientRect();

        // Shift up and towards left a bit
        const top = ratingRect.bottom - containerRect.top-14; // was +36
        const left = ratingRect.left - containerRect.left + 10; // was +30
        const width = detailRect.left - ratingRect.left + 80;

        setArrowPos({ top, left, width });
      }
    };

    updateArrowPosition();
    window.addEventListener('resize', updateArrowPosition);
    return () => window.removeEventListener('resize', updateArrowPosition);
  }, [loading]);

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
      <div
        className="hidden lg:block absolute z-0 pointer-events-none"
        style={{
          top: `${arrowPos.top}px`,
          left: `${arrowPos.left}px`,
          width: `${arrowPos.width}px`,
          height: '70px' // was 50px
        }}
      >
        <svg width={arrowPos.width} height="50" viewBox={`0 0 ${arrowPos.width} 70`} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Vertical down from below rating card (longer) */}
          <path d="M30 0 V45" stroke="#22c55e" strokeWidth="2.5" fill="none" />
          {/* Curve right (starts lower) */}
          <path d="M30 45 Q30 65, 80 65" stroke="#22c55e" strokeWidth="2.5" fill="none" />
          {/* Horizontal right to detailed ratings (longer) */}
          <path d={`M80 65 H${arrowPos.width - 30}`} stroke="#22c55e" strokeWidth="2.5" fill="none" />
          {/* Arrowhead */}
          <polygon points={`${arrowPos.width - 30},60 ${arrowPos.width - 20},65 ${arrowPos.width - 30},70`} fill="#22c55e" />
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <div ref={ratingCardRef} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${getRatingBgColor(stats.rating.average)} mr-4`}>
              <Star className={`h-6 w-6 ${getRatingColor(stats.rating.average)} fill-current`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Overall Rating</p>
              <div className="flex items-center space-x-2">
                <p className={`text-2xl font-semibold ${getRatingColor(stats.rating.average)}`}>
                  {formatRating(stats.rating.average)}
                </p>
                {stats.rating.average > 0 && (
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(stats.rating.average)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-1 w-full bg-gray-200 rounded-full">
              <div
                className={`h-1 rounded-full transition-all duration-500 ${
                  stats.rating.average >= 4.5
                    ? 'bg-green-500'
                    : stats.rating.average >= 4.0
                    ? 'bg-blue-500'
                    : stats.rating.average >= 3.5
                    ? 'bg-yellow-500'
                    : stats.rating.average >= 3.0
                    ? 'bg-orange-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${(stats.rating.average / 5) * 100}%` }}
              ></div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {stats.rating.count > 0
                ? `Based on ${stats.rating.count} review${stats.rating.count !== 1 ? 's' : ''}`
                : 'No reviews yet'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Earnings (MTD)</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${stats.earnings.thisMonth?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-1 w-full bg-gray-200 rounded-full">
              <div className="h-1 bg-green-500 rounded-full" style={{ width: '70%' }}></div>
            </div>
            <p className="mt-2 text-xs text-gray-500">70% of monthly goal</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Jobs</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeJobs}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Current workload</span>
              <span>{stats.activeJobs > 0 ? 'In progress' : 'Available'}</span>
            </div>
            <div className="mt-1 h-1 w-full bg-gray-200 rounded-full">
              <div
                className={`h-1 rounded-full ${
                  stats.activeJobs === 0
                    ? 'bg-green-500'
                    : stats.activeJobs <= 2
                    ? 'bg-yellow-500'
                    : stats.activeJobs <= 4
                    ? 'bg-orange-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((stats.activeJobs / 5) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Completed Jobs</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedJobs}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-1 w-full bg-gray-200 rounded-full">
              <div className="h-1 bg-purple-500 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {stats.completedJobs > 0
                ? `${stats.completedJobs} job${stats.completedJobs !== 1 ? 's' : ''} completed successfully`
                : 'No completed jobs yet'}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center mt-2">
        <div
          ref={detailedRatingRef}
          className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-wrap items-center justify-center px-4 py-2"
          style={{ minHeight: '44px', maxWidth: '600px', width: '100%' }}
        >
          <span className="text-xs font-semibold text-gray-700 mr-4">Detailed Ratings:</span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center space-x-1">
              <Award className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-700">Quality</span>
              <span className="font-semibold text-gray-900 ml-1">{formatRating(reviewStats.averageWorkQuality)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-700">Comm.</span>
              <span className="font-semibold text-gray-900 ml-1">{formatRating(reviewStats.averageCommunication)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-700">Time</span>
              <span className="font-semibold text-gray-900 ml-1">{formatRating(reviewStats.averageTimeliness)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-700">Prof.</span>
              <span className="font-semibold text-gray-900 ml-1">{formatRating(reviewStats.averageProfessionalism)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerStats;
