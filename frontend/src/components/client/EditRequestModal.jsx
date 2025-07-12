import React, { useState, useEffect } from 'react';
import { X, Upload, Image, FileText, Trash2, DollarSign, Calendar, MapPin, Tag, FileIcon, Edit3, AlertCircle } from 'lucide-react';
import { serviceRequestService } from '../../services/serviceRequestService';
import { useSocket } from '../../context/SocketContext';

const serviceCategories = [
  'Renovation',
  'Repair',
  'Installation',
  'Maintenance',
  'Landscaping',
  'Painting',
  'Cleaning',
  'Electrical',
  'Plumbing',
  'Flooring',
  'Roofing',
  'Carpentry'
];

const EditRequestModal = ({ isOpen, onClose, onSuccess, request }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attachments, setAttachments] = useState([]);
  const { emitNewServiceRequest } = useSocket();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    location: '',
    scheduledDate: '',
    requirements: '',
  });

  // Populate form when request changes
  useEffect(() => {
    if (request && isOpen) {
      setFormData({
        title: request.title || '',
        description: request.description || '',
        category: request.category || '',
        budget: request.budget?.toString() || '',
        location: request.location?.address || request.location?.city || '',
        scheduledDate: request.scheduledDate ? new Date(request.scheduledDate).toISOString().split('T')[0] : '',
        requirements: Array.isArray(request.requirements) ? request.requirements.join('\n') : (request.requirements || ''),
      });
      setError('');
      setAttachments([]);
    }
  }, [request, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments(prev => {
      const attachment = prev.find(att => att.id === id);
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter(att => att.id !== id);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  // Cloudinary upload function (same as NewRequestModal)
  const uploadFilesToCloud = async () => {
    if (attachments.length === 0) return [];
    const files = attachments.map(att => att.file);
    const uploadRes = await serviceRequestService.uploadFiles(files);
    return uploadRes.urls || [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let images = [];
      if (attachments.length > 0) {
        images = await uploadFilesToCloud();
      }
      const requestData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget: parseFloat(formData.budget),
        location: formData.location,
        scheduledDate: formData.scheduledDate || undefined,
        requirements: formData.requirements ? formData.requirements.split('\n').filter(req => req.trim()) : [],
        images, // Only new uploads are used
      };
      const response = await serviceRequestService.updateServiceRequest(request._id, requestData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        budget: '',
        location: '',
        scheduledDate: '',
        requirements: '',
      });
      setAttachments([]);
      
      onSuccess();
    } catch (error) {
      console.error('Update service request error:', error);
      setError(error.response?.data?.message || 'Failed to update service request');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Clean up any object URLs
    attachments.forEach(att => {
      if (att.preview) {
        URL.revokeObjectURL(att.preview);
      }
    });
    setAttachments([]);
    setError('');
    onClose();
  };

  if (!isOpen || !request) return null;

  // Check if request can be edited
  const canEdit = request.status === 'pending';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={handleClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-500 dark:to-orange-600 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                  <Edit3 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Edit Service Request</h2>
                  <p className="text-orange-100 mt-0.5 text-sm">Update your project details and requirements</p>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Status Warning */}
            {!canEdit && (
              <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200 px-3 py-2 rounded-lg flex items-center text-sm">
                <AlertCircle className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-medium">Cannot Edit Request</p>
                  <p className="text-xs">This request cannot be edited because it has been {request.status}. Only pending requests can be modified.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-3 py-2 rounded-lg flex items-center text-sm">
                <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full mr-2"></div>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center mb-3">
                  <div className="w-7 h-7 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mr-2">
                    <Tag className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      disabled={!canEdit}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-sm ${
                        !canEdit ? 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed' : ''
                      }`}
                      placeholder="e.g., Kitchen Renovation, Bathroom Repair, Garden Landscaping"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      disabled={!canEdit}
                      className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                        !canEdit ? 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed' : ''
                      }`}
                      required
                    >
                      <option value="">Select a category</option>
                      {serviceCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Budget (USD) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="number"
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        disabled={!canEdit}
                        min="1"
                        step="0.01"
                        className={`w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                          !canEdit ? 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed' : ''
                        }`}
                        placeholder="Your estimated budget"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={!canEdit}
                    rows={4}
                    className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none ${
                      !canEdit ? 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed' : ''
                    }`}
                    placeholder="Describe your project in detail. Include what needs to be done, any specific requirements, materials needed, etc."
                    required
                  />
                </div>
              </div>

              {/* Location & Schedule */}
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                    <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Location & Schedule</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        disabled={!canEdit}
                        className={`w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                          !canEdit ? 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed' : ''
                        }`}
                        placeholder="City, State or full address"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preferred Start Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="date"
                        id="scheduledDate"
                        name="scheduledDate"
                        value={formData.scheduledDate}
                        onChange={handleChange}
                        disabled={!canEdit}
                        className={`w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                          !canEdit ? 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements & Attachments */}
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-3">
                    <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Additional Details</h3>
                </div>

                <div>
                  <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Special Requirements
                  </label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    disabled={!canEdit}
                    rows={3}
                    className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none ${
                      !canEdit ? 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed' : ''
                    }`}
                    placeholder="Any special requirements, materials, tools, or notes (one per line)"
                  />
                </div>

                {/* File Upload - Only show if can edit */}
                {canEdit && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Attachments
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-orange-400 dark:hover:border-orange-500 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-3">
                            <Upload className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                            Click to upload files
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Images, PDFs, or documents (Max 10MB each)
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Attachment Preview */}
                    {attachments.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploaded Files ({attachments.length})</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                              {attachment.preview ? (
                                <img 
                                  src={attachment.preview} 
                                  alt={attachment.name}
                                  className="w-10 h-10 object-cover rounded mr-3"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center mr-3">
                                  {getFileIcon(attachment.type)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {attachment.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatFileSize(attachment.size)}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAttachment(attachment.id)}
                                className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors"
                >
                  {canEdit ? 'Cancel' : 'Close'}
                </button>
                {canEdit && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Request'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRequestModal;