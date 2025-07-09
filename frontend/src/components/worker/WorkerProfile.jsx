import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Save, 
  X, 
  Edit3, 
  Shield, 
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  Loader,
  Star,
  Briefcase,
  DollarSign,
  Award,
  Users,
  MessageSquare,
  Plus,
  Trash2
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { authService } from '../../services/authService';
import { serviceRequestService } from '../../services/serviceRequestService';
import { reviewService } from '../../services/reviewService';

// Function to get initials from name
const getInitials = (name) => {
  if (!name) return 'U';
  const nameParts = name.trim().split(' ');
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }
  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
};

// Function to get consistent background color based on name
const getAvatarColor = (name) => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-rose-500'
  ];
  
  if (!name) return 'bg-gray-500';
  
  // Generate consistent color based on name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Avatar component
const Avatar = ({ person, size = 'lg', editable = false, onImageUpload }) => {
  if (!person) return null;
  
  const sizeClasses = size === 'xl' ? 'w-32 h-32 text-2xl' : size === 'lg' ? 'w-20 h-20 text-xl' : 'w-16 h-16 text-lg';
  
  if (person.profileImage) {
    return (
      <div className="relative">
        <img
          src={person.profileImage}
          alt={person.name || 'User'}
          className={`${sizeClasses} rounded-full object-cover border-4 border-white shadow-lg`}
        />
        {editable && (
          <button
            onClick={onImageUpload}
            className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors shadow-lg"
          >
            <Camera className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
  
  const initials = getInitials(person.name);
  const colorClass = getAvatarColor(person.name);
  
  return (
    <div className="relative">
      <div className={`${sizeClasses} rounded-full ${colorClass} flex items-center justify-center border-4 border-white shadow-lg`}>
        <span className="text-white font-bold">{initials}</span>
      </div>
      {editable && (
        <button
          onClick={onImageUpload}
          className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors shadow-lg"
        >
          <Camera className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

const renderStars = (value) => (
  <span className="flex items-center space-x-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-4 w-4 ${star <= value ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))}
    {typeof value === 'number' && value > 0 && (
      <span className="ml-1 text-sm text-gray-600">{value.toFixed(1)}</span>
    )}
  </span>
);

const WorkerProfile = ({ onClose }) => {
  const { user, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    activeJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    rating: { average: 0, count: 0 }
  });
  const [reviewStats, setReviewStats] = useState({
    averageWorkQuality: 0,
    averageCommunication: 0,
    averageTimeliness: 0,
    averageProfessionalism: 0
  });

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: typeof user?.location === 'string' ? user.location : 
              typeof user?.location === 'object' && user?.location?.address ? user.location.address : '',
    skills: user?.skills ? (Array.isArray(user.skills) ? user.skills : [user.skills]) : [],
    experience: user?.experience || 0,
    hourlyRate: user?.hourlyRate || 0,
    availability: user?.availability || 'available',
    profileImage: user?.profileImage || ''
  });

  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchWorkerStats();
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: typeof user.location === 'string' ? user.location : 
                  typeof user.location === 'object' && user.location?.address ? user.location.address : '',
        skills: user.skills ? (Array.isArray(user.skills) ? user.skills : [user.skills]) : [],
        experience: user.experience || 0,
        hourlyRate: user.hourlyRate || 0,
        availability: user.availability || 'available',
        profileImage: user.profileImage || ''
      });
    }
  }, [user]);

  const fetchWorkerStats = async () => {
    try {
      // Get active and completed jobs
      const activeJobsResponse = await serviceRequestService.getWorkerJobs();
      const allJobs = activeJobsResponse.data.serviceRequests || [];
      const activeJobs = allJobs.filter(job => job.status === 'accepted' || job.status === 'in-progress');
      
      const completedJobsResponse = await serviceRequestService.getCompletedJobs();
      const completedJobs = completedJobsResponse.data.serviceRequests || [];
      
      // Calculate total earnings from completed jobs
      const totalEarnings = completedJobs.reduce((sum, job) => sum + (job.budget || 0), 0);
      
      // Get review statistics
      let reviewStatsData = {
        averageWorkQuality: 0,
        averageCommunication: 0,
        averageTimeliness: 0,
        averageProfessionalism: 0
      };
      
      if (user?._id) {
        try {
          const reviewRes = await reviewService.getWorkerReviews(user._id);
          if (reviewRes?.data?.statistics) {
            reviewStatsData = {
              averageWorkQuality: reviewRes.data.statistics.averageWorkQuality || 0,
              averageCommunication: reviewRes.data.statistics.averageCommunication || 0,
              averageTimeliness: reviewRes.data.statistics.averageTimeliness || 0,
              averageProfessionalism: reviewRes.data.statistics.averageProfessionalism || 0
            };
          }
        } catch (reviewError) {
          // console.log('No reviews found or error fetching reviews');
        }
      }

      setStats({
        activeJobs: activeJobs.length,
        completedJobs: completedJobs.length,
        totalEarnings,
        rating: user?.rating || { average: 0, count: 0 }
      });

      setReviewStats(reviewStatsData);
    } catch (error) {
      console.error('Failed to fetch worker stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setUploadingImage(true);
        try {
          // In a real app, you'd upload to a cloud service like Cloudinary
          // For now, we'll just convert to base64 or use a placeholder
          const reader = new FileReader();
          reader.onload = () => {
            setFormData(prev => ({
              ...prev,
              profileImage: reader.result
            }));
            setUploadingImage(false);
          };
          reader.readAsDataURL(file);
        } catch (error) {
          setError('Failed to upload image');
          setUploadingImage(false);
        }
      }
    };
    input.click();
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.updateWorkerProfile(formData);
      updateUser(response.data.worker);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: typeof user?.location === 'string' ? user.location : 
                typeof user?.location === 'object' && user?.location?.address ? user.location.address : '',
      skills: user?.skills ? (Array.isArray(user.skills) ? user.skills : [user.skills]) : [],
      experience: user?.experience || 0,
      hourlyRate: user?.hourlyRate || 0,
      availability: user?.availability || 'available',
      profileImage: user?.profileImage || ''
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
    setNewSkill('');
  };

  const getAvailabilityBadge = (availability) => {
    const badges = {
      available: 'bg-green-100 text-green-800 border-green-200',
      busy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      unavailable: 'bg-red-100 text-red-800 border-red-200'
    };
    return badges[availability] || badges.available;
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-t-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-6">
          <Avatar 
            person={{ ...user, ...formData }} 
            size="xl" 
            editable={isEditing} 
            onImageUpload={handleImageUpload} 
          />
          {uploadingImage && (
            <div className="absolute top-20 left-20">
              <Loader className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
          
          <div className="text-white flex-1">
            <h1 className="text-3xl font-bold">{user?.name || 'Worker'}</h1>
            <p className="text-green-100 flex items-center gap-2 mt-1">
              <Shield className="h-4 w-4" />
              Professional Worker
            </p>
            <p className="text-green-100 flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                {renderStars(stats.rating.average)}
                <span className="text-green-100 text-sm">({stats.rating.count} reviews)</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getAvailabilityBadge(user?.availability || 'available')}`}>
                {(user?.availability || 'available').charAt(0).toUpperCase() + (user?.availability || 'available').slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Active Jobs</p>
                <p className="text-2xl font-bold text-blue-800">{stats.activeJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-800">{stats.completedJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Earned</p>
                <p className="text-2xl font-bold text-purple-800">₹{stats.totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-600 rounded-lg">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-yellow-600 font-medium">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.rating.average.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Review Statistics */}
        {(reviewStats.averageWorkQuality > 0 || reviewStats.averageCommunication > 0 || 
          reviewStats.averageTimeliness > 0 || reviewStats.averageProfessionalism > 0) && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Ratings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Work Quality:</span>
                </div>
                {renderStars(reviewStats.averageWorkQuality)}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Communication:</span>
                </div>
                {renderStars(reviewStats.averageCommunication)}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Timeliness:</span>
                </div>
                {renderStars(reviewStats.averageTimeliness)}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Professionalism:</span>
                </div>
                {renderStars(reviewStats.averageProfessionalism)}
              </div>
            </div>
          </div>
        )}

        {/* Profile Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              {success}
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-gray-800 bg-white p-3 rounded-lg border">{user?.name || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-2" />
                Email Address
              </label>
              <p className="text-gray-800 bg-white p-3 rounded-lg border">{user?.email || 'Not provided'}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed for security reasons</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-2" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-gray-800 bg-white p-3 rounded-lg border">{user?.phone || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-2" />
                Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="City, State"
                />
              ) : (
                <p className="text-gray-800 bg-white p-3 rounded-lg border">
                  {typeof user?.location === 'string' ? user.location : 
                   typeof user?.location === 'object' && user?.location?.address ? user.location.address :
                   'Not provided'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="h-4 w-4 inline mr-2" />
                Experience (Years)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Years of experience"
                />
              ) : (
                <p className="text-gray-800 bg-white p-3 rounded-lg border">{user?.experience || 0} years</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-2" />
                Hourly Rate
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Rate per hour"
                />
              ) : (
                <p className="text-gray-800 bg-white p-3 rounded-lg border">${user?.hourlyRate || 0}/hour</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability Status
              </label>
              {isEditing ? (
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              ) : (
                <span className={`inline-block px-3 py-2 rounded-lg text-sm font-medium ${getAvailabilityBadge(user?.availability || 'available')}`}>
                  {(user?.availability || 'available').charAt(0).toUpperCase() + (user?.availability || 'available').slice(1)}
                </span>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Award className="h-4 w-4 inline mr-2" />
                Skills
              </label>
              {isEditing ? (
                <div>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Add a skill..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-3 rounded-lg border">
                  {user?.skills && user.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(user.skills) ? user.skills : [user.skills]).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No skills added yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
