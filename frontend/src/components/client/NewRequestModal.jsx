import React, { useState } from 'react';
import { X, Upload, Image, FileText, Trash2, DollarSign, Calendar, MapPin, Tag, FileIcon } from 'lucide-react';
import { serviceRequestService } from '../../services/serviceRequestService';
import { useSocket } from '../../context/SocketContext';
import { SERVICE_CATEGORIES } from '../../data/skillTaxonomy';
import SkillSelector from '../shared/SkillSelector';

const NewRequestModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attachments, setAttachments] = useState([]);
  const { emitNewServiceRequest } = useSocket();

  const [formData, setFormData] = useState({
    title: '', description: '', category: '', budget: '',
    location: '', scheduledDate: '', requirements: '', requiredSkills: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (skills) => {
    setFormData(prev => ({ ...prev, requiredSkills: skills }));
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

  // ✅ Cloudinary upload function
  const uploadFilesToCloud = async () => {
    // Send File objects directly to the service
    const files = attachments.map(att => att.file);
    const response = await serviceRequestService.uploadFiles(files);
    return response.urls;
  };
  const removeAttachment = (id) => {
    setAttachments(prev => {
      const attachment = prev.find(att => att.id === id);
      if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required skills
      if (formData.requiredSkills.length === 0) {
        throw new Error('Please select at least one required skill for this job');
      }

      let uploadedUrls = [];
      if (attachments.length > 0) {
        uploadedUrls = await uploadFilesToCloud();
      }

      const requestData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget: parseFloat(formData.budget),
        location: formData.location,
        scheduledDate: formData.scheduledDate || undefined,
        requirements: formData.requirements ? formData.requirements.split('\n').filter(req => req.trim()) : [],
        requiredSkills: formData.requiredSkills,
        images: uploadedUrls
      };

      const response = await serviceRequestService.createServiceRequest(requestData);

      emitNewServiceRequest({
        requestId: response._id, // Changed from response.serviceRequest._id
        title: requestData.title,
        category: requestData.category,
        budget: requestData.budget
      });

      setFormData({
        title: '', description: '', category: '', budget: '',
        location: '', scheduledDate: '', requirements: '', requiredSkills: []
      });
      setAttachments([]);
      onSuccess();

    } catch (error) {
      console.error('Create service request error:', error);
      setError(error.response?.data?.message || 'Failed to create service request');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    attachments.forEach(att => att.preview && URL.revokeObjectURL(att.preview));
    setAttachments([]);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={handleClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="relative w-full max-w-3xl bg-white dark:bg-[#0A0A0A] rounded-xl shadow-2xl transform transition-all border dark:border-[#404040]">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 dark:from-dark-primary dark:to-blue-700 px-4 py-3 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Create New Service Request</h2>
                <p className="text-blue-100 dark:text-blue-200 mt-0.5 text-xs">Tell us about your project and find the perfect professional</p>
              </div>
              <button 
                onClick={handleClose}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto dark:bg-[#171717]">
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg flex items-center text-sm">
                <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full mr-2"></div>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center mb-3">
                  <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-2">
                    <Tag className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-[#A3A3A3]">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-[#A3A3A3] mb-1">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-[#404040] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-[#262626] text-gray-900 dark:text-[#A3A3A3] transition-colors text-sm"
                      placeholder="e.g., Kitchen Renovation, Bathroom Repair, Garden Landscaping"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-[#A3A3A3] mb-1">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-[#404040] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-[#262626] text-gray-900 dark:text-[#A3A3A3] transition-colors text-sm"
                      required
                    >
                      <option value="">Select a category</option>
                      {SERVICE_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-[#A3A3A3] mb-1">
                      Budget (USD) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#737373]" />
                      <input
                        type="number"
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        min="1"
                        step="0.01"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-[#404040] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-[#262626] text-gray-900 dark:text-[#A3A3A3] transition-colors text-sm"
                        placeholder="Your estimated budget"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-[#A3A3A3] mb-1">
                    Project Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#404040] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-[#262626] text-gray-900 dark:text-[#A3A3A3] transition-colors resize-none text-sm"
                    placeholder="Describe your project in detail. Include what needs to be done, any specific requirements, materials needed, etc."
                    required
                  />
                </div>

                {/* Required Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#A3A3A3] mb-1">
                    Required Skills * 
                    <span className="text-xs text-gray-500 dark:text-[#737373] font-normal ml-1">(This enables smart worker matching)</span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-[#737373] mb-2">
                    Select specific skills required for this job. This helps workers understand if they're qualified and enables our matching system.
                  </p>
                  <SkillSelector
                    selectedSkills={formData.requiredSkills}
                    onSkillsChange={handleSkillsChange}
                    placeholder="Select required skills for this job..."
                    showCategories={true}
                    showPopular={true}
                    className="w-full"
                  />
                  {formData.requiredSkills.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">⚠️ Please select at least one required skill to enable smart worker matching</p>
                  )}
                  {formData.requiredSkills.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">✅ Great! You'll be able to view matching workers for this job</p>
                  )}
                </div>
              </div>

              {/* Location & Schedule */}
              <div className="space-y-4">
                <div className="flex items-center mb-3">
                  <div className="w-7 h-7 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-2">
                    <MapPin className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-[#A3A3A3]">Location & Schedule</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-[#A3A3A3] mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#737373]" />
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-[#404040] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-[#262626] text-gray-900 dark:text-[#A3A3A3] transition-colors text-sm"
                        placeholder="City, State or full address"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 dark:text-[#A3A3A3] mb-1">
                      Preferred Start Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#737373]" />
                      <input
                        type="date"
                        id="scheduledDate"
                        name="scheduledDate"
                        value={formData.scheduledDate}
                        onChange={handleChange}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-[#404040] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-[#262626] text-gray-900 dark:text-[#A3A3A3] transition-colors text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements & Attachments */}
              <div className="space-y-4">
                <div className="flex items-center mb-3">
                  <div className="w-7 h-7 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-2">
                    <FileText className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-[#A3A3A3]">Additional Details</h3>
                </div>

                <div>
                  <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 dark:text-[#A3A3A3] mb-1">
                    Special Requirements
                  </label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#404040] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-[#262626] text-gray-900 dark:text-[#A3A3A3] transition-colors resize-none text-sm"
                    placeholder="Any special requirements, materials, tools, or notes (one per line)"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#A3A3A3] mb-1">
                    Attachments
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-[#404040] rounded-lg p-4 text-center hover:border-blue-400 dark:hover:border-blue-400 transition-colors bg-white dark:bg-[#262626]">
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
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                          <Upload className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-[#A3A3A3] mb-0.5">
                          Click to upload files
                        </p>
                        <p className="text-xs text-gray-500 dark:text-[#737373]">
                          Images, PDFs, or documents (Max 10MB each)
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Attachment Preview */}
                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-[#A3A3A3]">Uploaded Files ({attachments.length})</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center p-2 bg-gray-50 dark:bg-[#262626] rounded-lg border border-gray-200 dark:border-[#404040]">
                            {attachment.preview ? (
                              <img 
                                src={attachment.preview} 
                                alt={attachment.name}
                                className="w-8 h-8 object-cover rounded mr-2"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-200 dark:bg-[#404040] rounded flex items-center justify-center mr-2">
                                {getFileIcon(attachment.type)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 dark:text-[#A3A3A3] truncate">
                                {attachment.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-[#737373]">
                                {formatFileSize(attachment.size)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(attachment.id)}
                              className="ml-1 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-[#404040]">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 dark:border-[#404040] text-gray-700 dark:text-[#A3A3A3] bg-white dark:bg-[#262626] rounded-lg hover:bg-gray-50 dark:hover:bg-[#404040] font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRequestModal;