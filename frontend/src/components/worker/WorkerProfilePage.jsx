import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { authService } from '../../services/authService';
import { reviewService } from '../../services/reviewService';
import { workerService } from '../../services/workerService';
import { portfolioService } from '../../services/portfolioService';
import { Camera, MapPin, Phone, Mail, Star, DollarSign, Calendar, Briefcase, Award, TrendingUp, Users, PlusCircle, UploadCloud, Eye, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [portfolio, setPortfolio] = useState([]);
  const [showPortfolioDialog, setShowPortfolioDialog] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [jobSelectionStep, setJobSelectionStep] = useState(false);
  const [jobsWithoutPortfolio, setJobsWithoutPortfolio] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [portfolioIndex, setPortfolioIndex] = useState(0);
  const [activeSection, setActiveSection] = useState('overview'); // 'overview', 'portfolio', 'details', 'statistics', 'payments', 'contact'

  const nextPortfolioItem = () => {
    setPortfolioIndex((prev) => (prev + 1) % portfolio.length);
  };

  const prevPortfolioItem = () => {
    setPortfolioIndex((prev) => (prev - 1 + portfolio.length) % portfolio.length);
  };

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (user && userId) {
      // console.log('User data available, user ID:', userId);
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
      fetchWorkerPortfolio();
    } else {
      // console.log('User data not available yet or missing ID');
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

  const fetchWorkerPortfolio = async () => {
    try {
      // Make sure user and user ID exist before making the request
      const userId = user?._id || user?.id;
      if (!user || !userId) {
        // console.log('User or user ID not available yet for portfolio fetch');
        return;
      }
      
      // console.log('Fetching portfolio for user ID:', userId);
      const response = await portfolioService.getPortfolio(userId);
      setPortfolio(response.data || []);
      // console.log('Portfolio fetched successfully:', response.data);
    } catch (error) {
      console.error('Error fetching worker portfolio:', error);
      setPortfolio([]);
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
  const handleClosePortfolioModal = () => {
    setShowPortfolioModal(false);
    // Refresh portfolio after adding new entry
    const userId = user?._id || user?.id;
    if (userId) {
      fetchWorkerPortfolio();
    }
  };

  const openImageModal = (images, index) => {
    setSelectedImage(images);
    setImageIndex(index);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setImageIndex(0);
  };

  const nextImage = () => {
    setImageIndex((prev) => (prev + 1) % selectedImage.length);
  };

  const prevImage = () => {
    setImageIndex((prev) => (prev - 1 + selectedImage.length) % selectedImage.length);
  };

  const goBackToOverview = () => {
    setActiveSection('overview');
  };

  const navigateToSection = (section) => {
    setActiveSection(section);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-green-50/60 to-white/80">
      <div className="flex-1 overflow-y-auto thin-scrollbar">
        <div className="max-w-6xl mx-auto space-y-4 p-2 sm:p-4 pb-8">
        {/* Header Card */}
        <div className="bg-white/60 backdrop-blur-sm border border-green-200/40 shadow-xl rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-flipIn">
          <div className="flex items-center gap-3">
            {activeSection !== 'overview' && (
              <button
                onClick={goBackToOverview}
                className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-green-900">
                {activeSection === 'overview' && 'My Profile'}
                {activeSection === 'portfolio' && 'Portfolio'}
                {activeSection === 'details' && 'Basic Details'}
                {activeSection === 'statistics' && 'Job Statistics'}
                {activeSection === 'payments' && 'Payments'}
                {activeSection === 'contact' && 'Contact Info'}
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                {activeSection === 'overview' && 'Manage your worker profile and showcase your skills'}
                {activeSection === 'portfolio' && 'View and manage your portfolio'}
                {activeSection === 'details' && 'Edit your basic information'}
                {activeSection === 'statistics' && 'View your job performance statistics'}
                {activeSection === 'payments' && 'Manage your payment information'}
                {activeSection === 'contact' && 'Update your contact details'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {activeSection === 'overview' && (
              <button
                onClick={handleOpenPortfolioDialog}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-md shadow-sm transition-all flex items-center gap-2 min-w-[140px]"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Portfolio</span>
              </button>
            )}
            {activeSection === 'portfolio' && (
              <button
                onClick={handleOpenPortfolioDialog}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-md shadow-sm transition-all flex items-center gap-2 min-w-[140px]"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Portfolio</span>
              </button>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-700 px-3 py-2 rounded-lg text-xs animate-fadeIn backdrop-blur-sm">{error}</div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-400/30 text-green-700 px-3 py-2 rounded-lg text-xs animate-fadeIn backdrop-blur-sm">{success}</div>
        )}

        {/* Content Based on Active Section */}
        {activeSection === 'overview' && (
          <div className="max-w-xl mx-auto">
            {/* Navigation Sections */}
            <div className="bg-white/60 backdrop-blur-sm border border-green-200/40 shadow-xl rounded-2xl p-5 animate-flipIn">
              <h2 className="text-base font-semibold text-green-900 mb-5">Profile Sections</h2>
              <div className="space-y-2">
                
                {/* Visit Portfolio + Add Portfolio */}
                <button
                  onClick={() => navigateToSection('portfolio')}
                  className="w-full group bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg p-3 transition-all duration-200 text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors">
                      <Eye className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">Visit Portfolio + Add Portfolio</h3>
                      <p className="text-xs text-gray-600">{portfolio.length} projects</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                </button>

                {/* Basic Details */}
                <button
                  onClick={() => navigateToSection('details')}
                  className="w-full group bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg p-3 transition-all duration-200 text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors">
                      <Users className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">Basic Details</h3>
                      <p className="text-xs text-gray-600">Personal information</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                </button>

                {/* Job Statistics */}
                <button
                  onClick={() => navigateToSection('statistics')}
                  className="w-full group bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg p-3 transition-all duration-200 text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors">
                      <TrendingUp className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">Job Statistics</h3>
                      <p className="text-xs text-gray-600">{stats.totalJobs} total jobs</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                </button>

                {/* Payments */}
                <button
                  onClick={() => navigateToSection('payments')}
                  className="w-full group bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg p-3 transition-all duration-200 text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors">
                      <DollarSign className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">Payments</h3>
                      <p className="text-xs text-gray-600">₹{stats.totalEarned?.toLocaleString() || '0'} earned</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                </button>

                {/* Contact Info */}
                <button
                  onClick={() => navigateToSection('contact')}
                  className="w-full group bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg p-3 transition-all duration-200 text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors">
                      <Mail className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">Contact Info</h3>
                      <p className="text-xs text-gray-600">Email, phone, location</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Section */}
        {activeSection === 'portfolio' && (
          <div className="bg-white/60 backdrop-blur-sm border border-green-200/40 shadow-xl rounded-2xl p-4 animate-flipIn">
            {portfolio.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-green-900">Portfolio ({portfolio.length})</h2>
                  {portfolio.length > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevPortfolioItem}
                        className="p-1.5 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-sm text-gray-500 font-medium">
                        {portfolioIndex + 1} / {portfolio.length}
                      </span>
                      <button
                        onClick={nextPortfolioItem}
                        className="p-1.5 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Portfolio Item Display */}
                <div className="relative overflow-hidden">
                  <div 
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${portfolioIndex * 100}%)` }}
                  >
                    {portfolio.map((entry, index) => (
                      <div key={index} className="w-full flex-shrink-0">
                        <div className="bg-white border border-green-100 rounded-xl p-6 shadow-sm">
                          <div className="mb-4">
                            <h3 className="text-xl font-semibold text-green-900 mb-2">{entry.title}</h3>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                                <Calendar className="h-4 w-4" />
                                {entry.completedDate ? new Date(entry.completedDate).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-gray-600 mb-4 leading-relaxed">{entry.description}</div>
                          
                          {entry.images && entry.images.length > 0 && (
                            <div className="relative">
                              <div className="w-full">
                                <div
                                  className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-green-300 transition-all aspect-video"
                                  onClick={() => openImageModal(entry.images, 0)}
                                >
                                  <img
                                    src={entry.images[0]}
                                    alt={`${entry.title} - Main Image`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                  
                                  {entry.images.length > 1 && (
                                    <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm font-medium">
                                      +{entry.images.length - 1} more
                                    </div>
                                  )}
                                  
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                                    <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {portfolio.length > 1 && (
                  <div className="flex justify-center mt-4 gap-1">
                    {portfolio.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setPortfolioIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === portfolioIndex ? 'bg-green-500' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Portfolio Items</h3>
                <p className="text-gray-500 mb-4">Start showcasing your work by adding your first portfolio item.</p>
                <button
                  onClick={handleOpenPortfolioDialog}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-md shadow-sm transition-all flex items-center gap-2 mx-auto"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Portfolio Item
                </button>
              </div>
            )}
          </div>
        )}

        {/* Basic Details Section */}
        {activeSection === 'details' && (
          <div className="bg-white/60 backdrop-blur-sm border border-green-200/40 shadow-xl rounded-2xl p-4 animate-flipIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-green-900">Basic Details</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm rounded-md shadow-sm transition-all"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {formData.profileImage ? (
                    <img
                      src={formData.profileImage}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover border-2 border-green-200 shadow-md"
                    />
                  ) : (
                    <div className={`h-20 w-20 rounded-full ${getRandomColor()} flex items-center justify-center text-white text-xl font-semibold border-2 border-green-200 shadow-md`}>
                      {getInitials(formData.name || 'User')}
                    </div>
                  )}
                  {isEditing && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
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
                  <h3 className="text-lg font-medium text-green-900">{formData.name || 'Your Name'}</h3>
                  <p className="text-sm text-gray-500">Professional Worker</p>
                  <div className="flex items-center mt-1">
                    {renderStars(Math.round(stats.rating.average || 0))}
                    <span className="ml-2 text-sm text-gray-600">
                      {(stats.rating.average || 0).toFixed(1)} ({stats.totalReviews || 0} reviews)
                    </span>
                  </div>
                  {isEditing && (
                    <p className="text-xs text-gray-400 mt-1">Click on avatar to change photo</p>
                  )}
                </div>
              </div>
              
              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent disabled:bg-gray-50 text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent disabled:bg-gray-50 text-sm"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent disabled:bg-gray-50 text-sm"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent disabled:bg-gray-50 text-sm"
                    placeholder="Enter your location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent disabled:bg-gray-50 text-sm"
                    placeholder="Enter your hourly rate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent disabled:bg-gray-50 text-sm"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills (comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent disabled:bg-gray-50 text-sm"
                  placeholder="e.g., Plumbing, Electrical, Carpentry"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent disabled:bg-gray-50 text-sm"
                  placeholder="Describe your experience and qualifications..."
                />
              </div>
              {/* Submit Button */}
              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Reviews Section */}
        {activeSection === 'reviews' && (
          <div className="bg-white/60 backdrop-blur-sm border border-green-200/40 shadow-xl rounded-2xl p-4 animate-flipIn">
            <h2 className="text-lg font-semibold text-green-900 mb-4">Reviews ({reviews.length})</h2>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <div key={index} className="bg-white border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">{renderStars(review.rating)}</div>
                      <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700 mb-2 leading-relaxed">{review.comment}</p>
                    <p className="text-sm text-gray-500">- {review.client?.name || 'Anonymous'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                <p className="text-gray-500">Complete some jobs to start receiving client reviews.</p>
              </div>
            )}
          </div>
        )}

        {/* Job Statistics Section */}
        {activeSection === 'statistics' && (
          <div className="bg-white/60 backdrop-blur-sm border border-green-200/40 shadow-xl rounded-2xl p-4 animate-flipIn">
            <h2 className="text-lg font-semibold text-green-900 mb-6">Job Statistics</h2>
            
            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Comprehensive Job Status Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Job Overview
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Briefcase className="h-4 w-4 text-green-500" />
                      <span className="text-xs font-medium text-green-900">All Jobs</span>
                    </div>
                    <p className="text-xl font-bold text-green-700">{stats.totalJobs || 0}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Award className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium text-green-900">Completed</span>
                    </div>
                    <p className="text-xl font-bold text-green-700">{stats.completedJobs || 0}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="text-xs font-medium text-green-900">Active</span>
                    </div>
                    <p className="text-xl font-bold text-green-700">{stats.activeJobs || 0}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-xs font-medium text-green-900">Available</span>
                    </div>
                    <p className="text-xl font-bold text-green-700">{formData.availability === 'full-time' ? 'Full Time' : formData.availability === 'part-time' ? 'Part Time' : formData.availability === 'weekends' ? 'Weekends' : formData.availability === 'flexible' ? 'Flexible' : 'Not Set'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-900">Total Earned</p>
                    <p className="text-2xl font-bold text-green-700">${stats.totalEarned?.toLocaleString() || '0'}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>

            {/* Rating and Reviews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Rating</h3>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-green-600">{(stats.rating?.average || 0).toFixed(1)}</div>
                  <div>
                    <div className="flex items-center mb-2">{renderStars(Math.round(stats.rating?.average || 0))}</div>
                    <p className="text-sm text-gray-500">{stats.totalReviews || stats.rating?.count || 0} reviews</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Rate</h3>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-green-600">
                    {stats.totalJobs > 0 ? Math.round((stats.completedJobs / stats.totalJobs) * 100) : 0}%
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Success rate</p>
                    <p className="text-xs text-gray-500">{stats.completedJobs} of {stats.totalJobs} jobs</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Review Stats */}
            {reviews.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{reviewStats.workQuality}</div>
                    <p className="text-sm text-gray-600">Work Quality</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{reviewStats.communication}</div>
                    <p className="text-sm text-gray-600">Communication</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{reviewStats.timeliness}</div>
                    <p className="text-sm text-gray-600">Timeliness</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{reviewStats.professionalism}</div>
                    <p className="text-sm text-gray-600">Professionalism</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payments Section */}
        {activeSection === 'payments' && (
          <div className="bg-white/60 backdrop-blur-sm border border-green-200/40 shadow-xl rounded-2xl p-4 animate-flipIn">
            <h2 className="text-lg font-semibold text-green-900 mb-6">Payments</h2>
            
            {/* Earnings Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-900">Total Earned</p>
                    <p className="text-2xl font-bold text-green-700">${stats.totalEarned?.toLocaleString() || '0'}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-900">Hourly Rate</p>
                    <p className="text-2xl font-bold text-green-700">${formData.hourlyRate ? parseFloat(formData.hourlyRate).toLocaleString() : '0'}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-900">Avg per Job</p>
                    <p className="text-2xl font-bold text-green-700">
                      ${stats.completedJobs > 0 ? Math.round(stats.totalEarned / stats.completedJobs).toLocaleString() : '0'}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <span className="text-gray-700">Payment Method</span>
                  <span className="text-gray-500">Bank Transfer (Default)</span>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <span className="text-gray-700">Payment Schedule</span>
                  <span className="text-gray-500">Upon job completion</span>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <span className="text-gray-700">Processing Time</span>
                  <span className="text-gray-500">2-3 business days</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Need to update payment details?</h4>
                <p className="text-sm text-green-700 mb-3">Contact support to update your payment information or add new payment methods.</p>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm rounded-md transition-all">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Info Section */}
        {activeSection === 'contact' && (
          <div className="bg-white/60 backdrop-blur-sm border border-green-200/40 shadow-xl rounded-2xl p-4 animate-flipIn">
            <h2 className="text-lg font-semibold text-green-900 mb-6">Contact Information</h2>
            
            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Contact</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{formData.email || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">{formData.phone || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Service Area</p>
                    <p className="text-sm text-gray-600">{formData.location || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Schedule</p>
                    <p className="text-sm text-gray-600">{formData.availability || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Hourly Rate</p>
                    <p className="text-sm text-gray-600">${formData.hourlyRate || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Contact Info */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h4 className="font-medium text-green-900 mb-2">Update Contact Information</h4>
              <p className="text-sm text-green-700 mb-4">
                Keep your contact information up to date so clients can reach you easily.
              </p>
              <button 
                onClick={() => navigateToSection('details')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm rounded-md transition-all"
              >
                Edit Details
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
      {/* Portfolio Upload Dialog and Modal remain unchanged */}
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
      {showPortfolioModal && (
        <PortfolioUploadModal
          open={showPortfolioModal}
          onClose={handleClosePortfolioModal}
          autofillJob={selectedJob}
        />
      )}

      {/* Image Zoom Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
              <X className="h-6 w-6" />
            </button>
            {selectedImage.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            <img
              src={selectedImage[imageIndex]}
              alt="Zoomed project image"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {selectedImage.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {imageIndex + 1} / {selectedImage.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerProfilePage;
