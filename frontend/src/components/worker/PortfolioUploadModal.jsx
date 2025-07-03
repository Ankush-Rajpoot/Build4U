import React, { useState, useEffect } from 'react';
import { portfolioService } from '../../services/portfolioService';
import { X, UploadCloud, Loader2 } from 'lucide-react';

const PortfolioUploadModal = ({ open, onClose, autofillJob }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completedDate, setCompletedDate] = useState('');
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!open) return null;

  useEffect(() => {
    if (autofillJob) {
      setTitle(autofillJob.title || '');
      setDescription(autofillJob.description || '');
      setCompletedDate(autofillJob.completedDate ? new Date(autofillJob.completedDate).toISOString().slice(0, 10) : '');
    }
  }, [autofillJob]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviewUrls(files.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (!title || images.length === 0) {
        setError('Title and at least one image are required.');
        setLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('completedDate', completedDate);
      images.forEach(img => formData.append('images', img));
      await portfolioService.uploadPortfolio(formData);
      setSuccess('Portfolio entry uploaded successfully!');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload portfolio entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <UploadCloud className="h-6 w-6 text-blue-600" />
          Upload Past Work
        </h2>
        <p className="text-gray-600 mb-4">Showcase your completed jobs to future clients. Add a title, description, and upload up to 6 images.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              maxLength={60}
              placeholder="e.g. Kitchen Renovation, Garden Makeover"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Describe the work, challenges, or results (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={completedDate}
              onChange={e => setCompletedDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Images *</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full"
              required
              max={6}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {previewUrls.map((url, idx) => (
                <img key={idx} src={url} alt="Preview" className="h-16 w-16 object-cover rounded border" />
              ))}
            </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortfolioUploadModal;
