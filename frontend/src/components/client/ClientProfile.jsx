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
  Loader
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { authService } from '../../services/authService';
import { serviceRequestService } from '../../services/serviceRequestService';

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
            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
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
          className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Camera className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

const ClientProfile = ({ onClose }) => {
  const { user, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeRequests: 0,
    completedRequests: 0,
    totalSpent: 0
  });

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: typeof user?.location === 'string' ? user.location : 
              typeof user?.location === 'object' && user?.location?.address ? user.location.address : '',
    profileImage: user?.profileImage || ''
  });

  useEffect(() => {
    fetchClientStats();
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: typeof user.location === 'string' ? user.location : 
                  typeof user.location === 'object' && user.location?.address ? user.location.address : '',
        profileImage: user.profileImage || ''
      });
    }
  }, [user]);

  const fetchClientStats = async () => {
    try {
      const response = await serviceRequestService.getClientServiceRequests();
      const requests = response.data.serviceRequests || [];
      
      const totalRequests = requests.length;
      const activeRequests = requests.filter(r => r.status === 'accepted' || r.status === 'in-progress').length;
      const completedRequests = requests.filter(r => r.status === 'completed').length;
      const totalSpent = requests.filter(r => r.status === 'completed').reduce((sum, r) => sum + (r.budget || 0), 0);

      setStats({
        totalRequests,
        activeRequests,
        completedRequests,
        totalSpent
      });
    } catch (error) {
      console.error('Failed to fetch client stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      const response = await authService.updateClientProfile(formData);
      updateUser(response.data.client);
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
      profileImage: user?.profileImage || ''
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-xl relative">
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
          
          <div className="text-white">
            <h1 className="text-3xl font-bold">{user?.name || 'Client'}</h1>
            <p className="text-blue-100 flex items-center gap-2 mt-1">
              <Shield className="h-4 w-4" />
              Client Account
            </p>
            <p className="text-blue-100 flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
            </p>
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
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Requests</p>
                <p className="text-2xl font-bold text-blue-800">{stats.totalRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-600 font-medium">Active Jobs</p>
                <p className="text-2xl font-bold text-orange-800">{stats.activeRequests}</p>
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
                <p className="text-2xl font-bold text-green-800">{stats.completedRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-purple-800">${stats.totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
