import React, { useEffect, useRef } from 'react';
import { Star, X, Eye } from 'lucide-react';
import { serviceRequestService } from '../../services/serviceRequestService';
import WorkerPortfolioModal from '../worker/WorkerPortfolioModal';

const ProposalsModal = ({ open, requestId, onClose, onSelectWorker, anchorRef }) => {
  const [workers, setWorkers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [portfolioModal, setPortfolioModal] = React.useState({ isOpen: false, worker: null });
  const modalRef = useRef(null);


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
  const Avatar = ({ worker }) => {
    if (worker.profilePicture) {
      return (
        <img
          src={worker.profilePicture}
          alt={worker.name || 'Worker'}
          className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
        />
      );
    }
    
    const initials = getInitials(worker.name);
    const colorClass = getAvatarColor(worker.name);
    
    return (
      <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center border-2 border-white shadow-sm flex-shrink-0`}>
        <span className="text-white font-semibold text-xs">{initials}</span>
      </div>
    );
  };


  useEffect(() => {
    if (open && requestId) {
      setLoading(true);
      setError('');
      serviceRequestService.getWorkerRequests(requestId)
        .then(res => setWorkers(res.workers || []))
        .catch(() => setError('Failed to load workers'))
        .finally(() => setLoading(false));
    }
  }, [open, requestId]);

  // Position modal directly over the anchor (request card) with exact same dimensions
  useEffect(() => {
    if (!open || !anchorRef?.current || !modalRef.current) return;

    const updatePosition = () => {
      if (anchorRef.current && modalRef.current) {
        const anchorRect = anchorRef.current.getBoundingClientRect();
        const modal = modalRef.current;
        
        // Position modal exactly over the card with precise dimensions
        modal.style.position = 'fixed';
        modal.style.left = `${anchorRect.left}px`;
        modal.style.top = `${anchorRect.top}px`;
        modal.style.width = `${anchorRect.width}px`;
        modal.style.height = `${anchorRect.height}px`;
        modal.style.zIndex = '60';
      }
    };

    // Initial positioning
    updatePosition();

    // Update position on scroll and resize
    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener('scroll', handleScroll, true); // Use capture to catch all scroll events
    window.addEventListener('resize', handleResize);
    
    // Also listen for any layout changes
    const resizeObserver = new ResizeObserver(updatePosition);
    if (anchorRef.current) {
      resizeObserver.observe(anchorRef.current);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [open, anchorRef]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-lg border border-gray-200 animate-cardFlipIn overflow-hidden"
        style={{ 
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden'
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Worker Proposals"
      >
      {/* Header with close button - styled like card back */}
      <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-b border-gray-200 px-4 py-3 h-16 flex items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-900">Worker Proposals</h3>
        </div>
        <button
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/70 focus:outline-none transition-all duration-200 hover:scale-110"
          onClick={onClose}
          aria-label="Close proposals modal"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      {/* Content area that fills the exact card dimensions */}
      <div className="flex flex-col" style={{ height: 'calc(100% - 4rem)' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <div className="text-gray-500 text-sm">Loading workers...</div>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-red-400 text-2xl mb-2">⚠️</div>
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          </div>
        ) : workers.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center px-4">
              <div className="text-gray-300 text-3xl mb-2">👥</div>
              <div className="text-gray-600 font-medium">No proposals yet</div>
              <div className="text-xs text-gray-400 mt-1">Workers will appear here when they apply</div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto blue-scrollbar p-3" style={{ maxHeight: 'calc(100% - 1rem)' }}>
            <div className="space-y-2">
              {workers.map((worker, idx) => (
                <div key={worker._id || idx} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border border-gray-100 hover:border-blue-200 hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <Avatar worker={worker} />
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-semibold text-gray-900 truncate text-xs">{worker.name || 'Worker'}</div>
                      <div className="text-xs text-gray-500 truncate">{worker.email}</div>
                      {worker.phone && (
                        <div className="text-xs text-gray-500 truncate">📱 {worker.phone}</div>
                      )}
                      <div className="flex items-center gap-1 text-amber-600 text-xs mt-0.5">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{worker.rating ? `${worker.rating}/5` : 'New'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <button
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 transition-colors font-medium flex items-center gap-1 whitespace-nowrap"
                        onClick={() => setPortfolioModal({ isOpen: true, worker })}
                      >
                        <Eye className="w-3 h-3" />
                        Past Work
                      </button>
                      <button
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md whitespace-nowrap"
                        onClick={() => onSelectWorker(worker)}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {workers.length > 10 && (
                <div className="text-center py-2 border-t border-gray-200 mt-3 pt-3">
                  <div className="text-xs text-gray-500 font-medium">
                    Showing all {workers.length} worker proposals
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Scroll to view more
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
      
      {/* Portfolio Modal - rendered outside the main modal */}
      <WorkerPortfolioModal
        isOpen={portfolioModal.isOpen}
        onClose={() => setPortfolioModal({ isOpen: false, worker: null })}
        worker={portfolioModal.worker}
      />
    </>
  );
};

export default ProposalsModal;
