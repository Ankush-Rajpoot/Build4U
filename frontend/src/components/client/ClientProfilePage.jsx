import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { authService } from '../../services/authService';
import { Camera, MapPin, Phone, Mail, Star, DollarSign, Calendar, Briefcase } from 'lucide-react';

const ClientProfilePage = () => {
  const { user, updateUser } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    profileImage: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    totalRequests: 0,
    completedJobs: 0,
    activeJobs: 0,
    totalSpent: 0,
    averageRating: 0
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: typeof user.location === 'string' ? user.location : user.location?.address || '',
        profileImage: user.profileImage || ''
      });
      
      // Fetch real statistics from backend
      fetchClientStats();
    }
  }, [user]);

  const fetchClientStats = async () => {
    try {
      const response = await authService.getClientStats();
      const fetchedStats = response.data.stats;
      setStats(fetchedStats);
    } catch (error) {
      console.error('Error fetching client stats:', error);
      // Fallback to user data if API fails
      setStats({
        totalRequests: user?.totalRequests || 0,
        completedJobs: user?.completedJobs || 0,
        activeJobs: user?.activeJobs || 0,
        totalSpent: user?.totalSpent || 0,
        averageRating: user?.averageRating || 0
      });
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
      const response = await authService.updateClientProfile(formData);
      updateUser(response.data.client);
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

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50/60 to-white/80">
      <div className="flex-1 overflow-y-auto thin-scrollbar">
        <div className="max-w-4xl mx-auto space-y-4 p-2 sm:p-4 pb-8">

          {/* Alerts */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-700 px-3 py-2 rounded-lg text-xs animate-fadeIn backdrop-blur-sm">{error}</div>
          )}
          {success && (
            <div className="bg-green-500/20 border border-green-400/30 text-green-700 px-3 py-2 rounded-lg text-xs animate-fadeIn backdrop-blur-sm">{success}</div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Profile Info Card */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white/60 backdrop-blur-sm border border-blue-200/40 shadow-xl rounded-2xl p-4 animate-flipIn">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-base sm:text-lg font-semibold text-blue-900">Profile Information</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs rounded-md shadow-sm transition-all h-8 min-w-[80px]"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Profile Picture */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {formData.profileImage ? (
                        <img
                          src={formData.profileImage}
                          alt="Profile"
                          className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover border-2 border-blue-200 shadow-md"
                        />
                      ) : (
                        <div className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full ${getRandomColor()} flex items-center justify-center text-white text-lg font-semibold border-2 border-blue-200 shadow-md`}>
                          {getInitials(formData.name || 'User')}
                        </div>
                      )}
                      {isEditing && (
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                          <Camera className="h-5 w-5 text-white" />
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
                      <h3 className="text-base font-medium text-blue-900">{formData.name || 'Your Name'}</h3>
                      <p className="text-xs text-gray-500">Client Account</p>
                      {isEditing && (
                        <p className="text-xs text-gray-400 mt-1">Click on avatar to change photo</p>
                      )}
                    </div>
                  </div>
                  {/* Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-50 text-xs"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-50 text-xs"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-50 text-xs"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-50 text-xs"
                        placeholder="Enter your location"
                      />
                    </div>
                  </div>
                  {/* Submit Button */}
                  {isEditing && (
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-xs"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
            {/* Sidebar Cards */}
            <div className="space-y-4">
              {/* Account Stats Card */}
              <div className="bg-white/60 backdrop-blur-sm border border-blue-200/40 shadow-xl rounded-2xl p-4 animate-flipIn">
                <h3 className="text-sm font-semibold text-blue-900 mb-3">Account Overview</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 text-blue-500 mr-1.5" />
                      <span className="text-xs text-gray-600">Total Requests</span>
                    </div>
                    <span className="font-semibold text-blue-900 text-xs">{stats.totalRequests || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-green-500 mr-1.5" />
                      <span className="text-xs text-gray-600">Completed Jobs</span>
                    </div>
                    <span className="font-semibold text-blue-900 text-xs">{stats.completedJobs || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-orange-500 mr-1.5" />
                      <span className="text-xs text-gray-600">Active Jobs</span>
                    </div>
                    <span className="font-semibold text-blue-900 text-xs">{stats.activeJobs || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-purple-500 mr-1.5" />
                      <span className="text-xs text-gray-600">Total Spent</span>
                    </div>
                    <span className="font-semibold text-blue-900 text-xs">${stats.totalSpent || 0}</span>
                  </div>
                </div>
              </div>
              {/* Contact Info Card */}
              <div className="bg-white/60 backdrop-blur-sm border border-blue-200/40 shadow-xl rounded-2xl p-4 animate-flipIn">
                <h3 className="text-sm font-semibold text-blue-900 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-xs text-gray-600">{formData.email || 'No email set'}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-xs text-gray-600">{formData.phone || 'No phone set'}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-xs text-gray-600">{formData.location || 'No location set'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfilePage;
