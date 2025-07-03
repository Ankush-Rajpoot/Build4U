import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { authService } from '../../services/authService';
import { reviewService } from '../../services/reviewService';
import { workerService } from '../../services/workerService';
import { Camera, MapPin, Phone, Mail, Star, DollarSign, Calendar, Briefcase, Award, TrendingUp, Users, PlusCircle, UploadCloud } from 'lucide-react';
import PortfolioUploadModal from './PortfolioUploadModal';

const WorkerProfilePage = () => {
  const { user, updateUser } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    skills: '',
    experience: '',
    hourlyRate: '',
    availability: '',
    profileImage: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    activeJobs: 0,
    totalEarned: 0,
    rating: { average: 0, count: 0 },
    totalReviews: 0
  });
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    workQuality: 0,
    communication: 0,
    timeliness: 0,
    professionalism: 0,
    wouldRecommend: 0
  });
  const [showPortfolioDialog, setShowPortfolioDialog] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [jobSelectionStep, setJobSelectionStep] = useState(false);
  const [jobsWithoutPortfolio, setJobsWithoutPortfolio] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: typeof user.location === 'string' ? user.location : user.location?.address || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : user.skills || '',
        experience: user.experience || '',
        hourlyRate: user.hourlyRate || '',
        availability: user.availability || '',
        profileImage: user.profileImage || ''
      });
      
      // Fetch real statistics from backend
      fetchWorkerStats();
      fetchWorkerReviews();
    }
  }, [user]);

  const fetchWorkerStats = async () => {
    try {
      // Get both profile data and stats to have consistent rating and accurate job counts
      const [profileResponse, statsResponse] = await Promise.all([
        authService.getWorkerProfile(),
        authService.getWorkerStats()
      ]);
      
      const workerProfile = profileResponse.data.worker;
      const fetchedStats = statsResponse.data.stats || {};
      
      setStats({
        totalJobs: fetchedStats.totalJobs || 0,
        completedJobs: fetchedStats.completedJobs || 0,
        activeJobs: fetchedStats.activeJobs || 0,
        totalEarned: fetchedStats.totalEarned || 0,
        rating: workerProfile?.rating || { average: 0, count: 0 },
        totalReviews: workerProfile?.rating?.count || 0
      });
    } catch (error) {
      console.error('Error fetching worker stats:', error);
      // Fallback to user data if API fails
      setStats({
        totalJobs: user?.totalJobs || 0,
        completedJobs: user?.completedJobs || 0,
        activeJobs: user?.activeJobs || 0,
        totalEarned: user?.totalEarned || 0,
        rating: user?.rating || { average: 0, count: 0 },
        totalReviews: user?.rating?.count || 0
      });
    }
  };

  const fetchWorkerReviews = async () => {
    try {
      const response = await reviewService.getMyWorkerReviews();
      const workerReviews = response.data.reviews || [];
      setReviews(workerReviews);
      
      // Calculate review statistics
      if (workerReviews.length > 0) {
        const totals = workerReviews.reduce((acc, review) => ({
          workQuality: acc.workQuality + (review.workQuality || 0),
          communication: acc.communication + (review.communication || 0),
          timeliness: acc.timeliness + (review.timeliness || 0),
          professionalism: acc.professionalism + (review.professionalism || 0),
          wouldRecommend: acc.wouldRecommend + (review.wouldRecommend ? 1 : 0)
        }), { workQuality: 0, communication: 0, timeliness: 0, professionalism: 0, wouldRecommend: 0 });

        setReviewStats({
          workQuality: (totals.workQuality / workerReviews.length).toFixed(1),
          communication: (totals.communication / workerReviews.length).toFixed(1),
          timeliness: (totals.timeliness / workerReviews.length).toFixed(1),
          professionalism: (totals.professionalism / workerReviews.length).toFixed(1),
          wouldRecommend: ((totals.wouldRecommend / workerReviews.length) * 100).toFixed(0)
        });
      }
    } catch (error) {
      console.error('Error fetching worker reviews:', error);
      // Don't show error to user for reviews, just log it
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profileImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submissionData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        hourlyRate: parseFloat(formData.hourlyRate) || 0
      };

      const response = await authService.updateWorkerProfile(submissionData);
      updateUser(response.data.worker);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRandomColor = () => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const handleOpenPortfolioDialog = async () => {
    setShowPortfolioDialog(true);
    setJobSelectionStep(true);
    setSelectedJob(null);
    // Fetch jobs only if not already fetched
    if (jobsWithoutPortfolio.length === 0) {
      try {
        const response = await workerService.getCompletedJobsWithoutPortfolio();
        setJobsWithoutPortfolio(response.data || []);
      } catch (err) {
        setJobsWithoutPortfolio([]);
      }
    }
  };
  const handleSelectJob = (job) => {
    setSelectedJob(job);
    setJobSelectionStep(false);
    setShowPortfolioDialog(false);
    setShowPortfolioModal(true);
  };
  const handleClosePortfolioDialog = () => setShowPortfolioDialog(false);
  const handleConfirmPortfolioDialog = () => {
    setShowPortfolioDialog(false);
    setShowPortfolioModal(true);
  };
  const handleClosePortfolioModal = () => setShowPortfolioModal(false);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your worker profile and showcase your skills</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleOpenPortfolioDialog}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PlusCircle className="h-5 w-5" />
              Add Past Work
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {formData.profileImage ? (
                    <img
                      src={formData.profileImage}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className={`h-20 w-20 rounded-full ${getRandomColor()} flex items-center justify-center text-white text-xl font-semibold border-2 border-gray-200`}>
                      {getInitials(formData.name || 'User')}
                    </div>
                  )}
                  {isEditing && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                      <Camera className="h-6 w-6 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{formData.name || 'Your Name'}</h3>
                  <p className="text-gray-500">Professional Worker</p>
                  <div className="flex items-center mt-1">
                    {renderStars(Math.round(stats.rating.average || 0))}
                    <span className="ml-2 text-sm text-gray-600">
                      {(stats.rating.average || 0).toFixed(1)} ({stats.totalReviews || 0} reviews)
                    </span>
                  </div>
                  {isEditing && (
                    <p className="text-sm text-gray-400 mt-1">Click on avatar to change photo</p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                    placeholder="Enter your location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                    placeholder="Enter your hourly rate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                  >
                    <option value="">Select availability</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="weekends">Weekends Only</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="e.g., Plumbing, Electrical, Carpentry"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience
                </label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="Describe your experience and qualifications..."
                />
              </div>

              {/* Submit Button */}
              {isEditing && (
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>

        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Account Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">Total Jobs</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.totalJobs || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Completed</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.completedJobs || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="text-sm text-gray-600">Active Jobs</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.activeJobs || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-sm text-gray-600">Total Earned</span>
                </div>
                <span className="font-semibold text-gray-900">${stats.totalEarned || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-600">Average Rating</span>
                </div>
                <span className="font-semibold text-gray-900">{(stats.rating.average || 0).toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-600">{formData.email || 'No email set'}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-600">{formData.phone || 'No phone set'}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-600">{formData.location || 'No location set'}</span>
              </div>
            </div>
          </div>

          {/* Recent Reviews */}
          {reviews.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
              <div className="space-y-4">
                {reviews.slice(0, 3).map((review, index) => (
                  <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{review.comment}</p>
                    <p className="text-xs text-gray-500 mt-1">- {review.client?.name || 'Anonymous'}</p>
                  </div>
                ))}
              </div>
              {reviews.length > 3 && (
                <p className="text-center text-sm text-blue-600 mt-4">
                  +{reviews.length - 3} more reviews
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Upload Dialog */}
      {showPortfolioDialog && jobSelectionStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
              <UploadCloud className="h-6 w-6 text-blue-600" />
              Select a completed job to upload past work
            </h2>
            {jobsWithoutPortfolio.length === 0 ? (
              <p className="text-gray-700">No completed jobs found without portfolio entry.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {jobsWithoutPortfolio.map(job => (
                  <button
                    key={job._id}
                    className="w-full text-left border border-gray-200 rounded-lg p-3 hover:bg-blue-50 transition-colors"
                    onClick={() => handleSelectJob(job)}
                  >
                    <div className="font-semibold text-gray-900">{job.title}</div>
                    <div className="text-xs text-gray-500">{job.description?.slice(0, 60)}{job.description?.length > 60 ? '...' : ''}</div>
                    <div className="text-xs text-gray-400 mt-1">Completed: {job.completedDate ? new Date(job.completedDate).toLocaleDateString() : '-'}</div>
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => { setShowPortfolioDialog(false); setJobSelectionStep(false); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Upload Modal */}
      {showPortfolioModal && (
        <PortfolioUploadModal
          open={showPortfolioModal}
          onClose={handleClosePortfolioModal}
          autofillJob={selectedJob}
        />
      )}
    </div>
  );
};

export default WorkerProfilePage;
