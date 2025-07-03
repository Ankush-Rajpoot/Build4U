import React, { useEffect, useState } from 'react';
import { X, Calendar, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { portfolioService } from '../../services/portfolioService';

const WorkerPortfolioModal = ({ isOpen, onClose, worker }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen && worker?._id) {
      fetchPortfolio();
    }
  }, [isOpen, worker]);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const response = await portfolioService.getPortfolio(worker._id);
      setPortfolio(response.data || []);
    } catch (error) {
      setPortfolio([]);
    } finally {
      setLoading(false);
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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-2 max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                {worker?.name?.charAt(0)?.toUpperCase() || 'W'}
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 leading-tight">{worker?.name}'s Portfolio</h2>
                <p className="text-xs text-gray-500">Completed projects</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Portfolio Content */}
          <div className="flex-1 overflow-y-auto px-4 py-3 bg-gradient-to-br from-blue-50 via-white to-indigo-50 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-200 hover:scrollbar-thumb-blue-500">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600 text-sm">Loading portfolio...</span>
              </div>
            ) : portfolio.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No past work uploaded yet</h3>
                <p className="text-gray-500 text-xs">This worker hasn't uploaded any portfolio entries.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {portfolio.map((entry, index) => (
                  <div key={index} className="bg-white border border-blue-100 rounded-xl p-3 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                    {/* Project Header */}
                    <div className="mb-2 flex flex-col gap-1">
                      <h3 className="text-sm font-semibold text-indigo-900 mb-0.5 truncate">{entry.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                          <Calendar className="h-3.5 w-3.5" />
                          Start: {entry.startDate ? new Date(entry.startDate).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                          <Calendar className="h-3.5 w-3.5" />
                          Finish: {entry.completedDate ? new Date(entry.completedDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                    {/* Description */}
                    <div className="text-xs text-gray-600 mb-2 line-clamp-2">{entry.description}</div>
                    {/* Project Images */}
                    {entry.images && entry.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-1.5 mb-2">
                        {entry.images.slice(0,4).map((image, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-100 hover:border-blue-300 transition-all"
                            onClick={() => openImageModal(entry.images, imgIndex)}
                          >
                            <img
                              src={image}
                              alt={`${entry.title} - Image ${imgIndex + 1}`}
                              className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-200"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                              <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Review Section */}
                    {entry.review && (entry.review.text || entry.review.rating) && (
                      <div className="mt-1 p-2 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-100">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-green-700">Review</span>
                          {entry.review.rating && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">★ {entry.review.rating.toFixed(1)}</span>
                          )}
                        </div>
                        {entry.review.text && (
                          <div className="text-xs text-gray-700 italic">"{entry.review.text}"</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative max-w-2xl max-h-full p-2">
            <button
              onClick={closeImageModal}
              className="absolute top-3 right-3 z-10 p-1.5 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
            {selectedImage.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1.5 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            <img
              src={selectedImage[imageIndex]}
              alt="Zoomed project image"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
            {selectedImage.length > 1 && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-0.5 rounded-full text-xs">
                {imageIndex + 1} / {selectedImage.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default WorkerPortfolioModal;
